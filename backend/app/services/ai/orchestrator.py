import asyncio
import json
from collections.abc import AsyncGenerator
from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import AgentRun, AgentStatus, Project, ProjectStatus, Report
from app.services.ai.agents import AGENT_DEFINITIONS, ORCHESTRATOR_SYSTEM
from app.services.ai.fireworks_client import get_llm_client


def build_project_context(project: Project) -> str:
    parts = [
        f"Business Name: {project.business_name}",
        f"Industry: {project.industry}",
        f"Problem Statement: {project.problem_statement}",
        f"Goals: {project.goals}",
        f"Budget: {project.budget}",
        f"Deadline: {project.deadline}",
    ]
    if project.document_context:
        parts.append(f"Uploaded Document Context:\n{project.document_context[:8000]}")
    return "\n\n".join(parts)


class OrchestratorService:
    def __init__(self, api_key: str | None = None):
        self.llm = get_llm_client()
        self.api_key = api_key

    async def run_agent(
        self,
        db: AsyncSession,
        agent_run: AgentRun,
        project: Project,
        system_prompt: str,
        event_queue: asyncio.Queue | None = None,
    ) -> str:
        agent_run.status = AgentStatus.RUNNING
        agent_run.started_at = datetime.now(UTC)
        await db.flush()

        context = build_project_context(project)
        user_prompt = f"Analyze this business project:\n\n{context}"

        output_parts: list[str] = []
        async for chunk in self.llm.stream(system_prompt, user_prompt, self.api_key):
            output_parts.append(chunk)
            if event_queue:
                await event_queue.put({
                    "type": "agent_chunk",
                    "agent_key": agent_run.agent_key,
                    "chunk": chunk,
                })

        output = "".join(output_parts)
        agent_run.output = output
        agent_run.status = AgentStatus.COMPLETED
        agent_run.completed_at = datetime.now(UTC)
        await db.flush()
        return output

    async def synthesize_report(
        self,
        db: AsyncSession,
        project: Project,
        agent_outputs: dict[str, str],
    ) -> Report:
        context = build_project_context(project)
        synthesis_input = f"Project Context:\n{context}\n\nSpecialist Agent Outputs:\n"
        for key, output in agent_outputs.items():
            synthesis_input += f"\n--- {key.upper()} ---\n{output[:3000]}\n"

        raw = await self.llm.complete(ORCHESTRATOR_SYSTEM, synthesis_input, self.api_key)

        try:
            start = raw.find("{")
            end = raw.rfind("}") + 1
            data = json.loads(raw[start:end]) if start >= 0 else json.loads(raw)
        except (json.JSONDecodeError, ValueError):
            data = {
                "executive_summary": raw[:2000],
                "market_analysis": agent_outputs.get("research", ""),
                "competitor_analysis": "See research agent output.",
                "business_strategy": agent_outputs.get("business_strategy", ""),
                "marketing_plan": agent_outputs.get("marketing", ""),
                "financial_projection": agent_outputs.get("finance", ""),
                "technical_architecture": agent_outputs.get("software_architecture", ""),
                "roadmap": "See business strategy output.",
                "risks": agent_outputs.get("quality_assurance", ""),
                "recommendations": "Review specialist outputs for detailed recommendations.",
                "next_steps": "1. Review report. 2. Validate assumptions. 3. Execute priority items.",
                "scores": {"business": 75, "risk": 40, "opportunity": 70},
                "chart_data": {
                    "revenue": [{"year": "Y1", "value": 500}, {"year": "Y2", "value": 1500}],
                    "market_share": [{"name": "Market", "value": 100}],
                },
                "timeline": [{"phase": "Phase 1", "start": "Now", "end": "3mo", "status": "in_progress"}],
            }

        report = Report(
            project_id=project.id,
            executive_summary=data.get("executive_summary", ""),
            market_analysis=data.get("market_analysis", ""),
            competitor_analysis=data.get("competitor_analysis", ""),
            business_strategy=data.get("business_strategy", ""),
            marketing_plan=data.get("marketing_plan", ""),
            financial_projection=data.get("financial_projection", ""),
            technical_architecture=data.get("technical_architecture", ""),
            roadmap=data.get("roadmap", ""),
            risks=data.get("risks", ""),
            recommendations=data.get("recommendations", ""),
            next_steps=data.get("next_steps", ""),
            scores=data.get("scores", {}),
            chart_data=data.get("chart_data", {}),
            timeline=data.get("timeline", []),
        )
        db.add(report)
        await db.flush()
        return report

    async def execute_workflow(
        self,
        db: AsyncSession,
        project_id: UUID,
        event_queue: asyncio.Queue | None = None,
    ) -> None:
        result = await db.execute(
            select(Project)
            .where(Project.id == project_id)
            .options(selectinload(Project.agent_runs))
        )
        project = result.scalar_one_or_none()
        if not project:
            return

        project.status = ProjectStatus.GENERATING
        await db.flush()

        async def emit(event_type: str, data: dict) -> None:
            if event_queue:
                await event_queue.put({"type": event_type, **data})

        agent_outputs: dict[str, str] = {}

        try:
            await emit("orchestrator_start", {"message": "Orchestrator coordinating agents..."})

            for definition in AGENT_DEFINITIONS:
                agent_run = next(
                    (r for r in project.agent_runs if r.agent_key == definition["key"]),
                    None,
                )
                if not agent_run:
                    continue

                await emit("agent_status", {
                    "agent_key": definition["key"],
                    "agent_name": definition["name"],
                    "status": "running",
                })

                output = await self.run_agent(
                    db, agent_run, project, definition["system_prompt"], event_queue
                )
                agent_outputs[definition["key"]] = output

                await emit("agent_status", {
                    "agent_key": definition["key"],
                    "agent_name": definition["name"],
                    "status": "completed",
                })

            await emit("orchestrator_synthesizing", {"message": "Synthesizing executive report..."})
            report = await self.synthesize_report(db, project, agent_outputs)

            project.status = ProjectStatus.COMPLETED
            await db.flush()

            await emit("workflow_complete", {
                "report_id": str(report.id),
                "scores": report.scores,
            })
        except Exception as e:
            project.status = ProjectStatus.FAILED
            await db.flush()
            await emit("workflow_error", {"error": str(e)})
            raise

    async def stream_workflow(
        self, db: AsyncSession, project_id: UUID
    ) -> AsyncGenerator[dict, None]:
        queue: asyncio.Queue = asyncio.Queue()
        task = asyncio.create_task(self.execute_workflow(db, project_id, queue))

        try:
            while True:
                try:
                    event = await asyncio.wait_for(queue.get(), timeout=0.5)
                    yield event
                    if event.get("type") in ("workflow_complete", "workflow_error"):
                        break
                except asyncio.TimeoutError:
                    if task.done():
                        if task.exception():
                            yield {"type": "workflow_error", "error": str(task.exception())}
                        break
                    yield {"type": "heartbeat"}
        finally:
            if not task.done():
                await task
