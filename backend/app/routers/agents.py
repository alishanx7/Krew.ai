import asyncio
import json
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import async_session, get_db
from app.models import AgentRun, AgentStatus, Project, ProjectStatus, Report, User
from app.services.ai.orchestrator import OrchestratorService
from app.services.auth import get_current_user
from app.services.pdf_export import generate_report_pdf

router = APIRouter(prefix="/agents", tags=["agents"])


@router.post("/projects/{project_id}/generate")
async def generate_strategy(
    project_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Project)
        .where(Project.id == project_id, Project.owner_id == user.id)
        .options(selectinload(Project.agent_runs), selectinload(Project.report))
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.status == ProjectStatus.GENERATING:
        raise HTTPException(status_code=409, detail="Generation already in progress")

    if project.report:
        await db.delete(project.report)
    for run in project.agent_runs:
        run.status = AgentStatus.WAITING
        run.output = None
        run.error = None
        run.started_at = None
        run.completed_at = None

    project.status = ProjectStatus.GENERATING
    await db.flush()

    return {"message": "Generation started", "project_id": str(project_id)}


@router.get("/projects/{project_id}/stream")
async def stream_generation(
    project_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.owner_id == user.id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Project not found")

    api_key = user.fireworks_api_key

    async def event_generator():
        async with async_session() as session:
            orchestrator = OrchestratorService(api_key=api_key)
            async for event in orchestrator.stream_workflow(session, project_id):
                yield f"data: {json.dumps(event)}\n\n"
                await asyncio.sleep(0.01)
            await session.commit()

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no"},
    )


@router.get("/projects/{project_id}/agents")
async def list_agent_runs(
    project_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AgentRun)
        .join(Project)
        .where(AgentRun.project_id == project_id, Project.owner_id == user.id)
        .order_by(AgentRun.order_index)
    )
    runs = result.scalars().all()
    return [
        {
            "id": str(r.id),
            "agent_key": r.agent_key,
            "agent_name": r.agent_name,
            "status": r.status.value,
            "output": r.output,
            "order_index": r.order_index,
        }
        for r in runs
    ]


@router.get("/projects/{project_id}/export/pdf")
async def export_pdf(
    project_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Project)
        .where(Project.id == project_id, Project.owner_id == user.id)
        .options(selectinload(Project.report))
    )
    project = result.scalar_one_or_none()
    if not project or not project.report:
        raise HTTPException(status_code=404, detail="Report not found")

    pdf_bytes = generate_report_pdf(project, project.report)
    filename = f"krew-ai-{project.business_name.replace(' ', '-').lower()}-report.pdf"
    return StreamingResponse(
        iter([pdf_bytes]),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
