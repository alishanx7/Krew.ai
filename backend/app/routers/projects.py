from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import AgentRun, AgentStatus, Document, Project, ProjectStatus, Report, User
from app.schemas import (
    AgentRunResponse,
    DashboardStats,
    ProjectCreate,
    ProjectDetailResponse,
    ProjectResponse,
    ProjectUpdate,
    ReportResponse,
)
from app.services.ai.agents import AGENT_DEFINITIONS
from app.database import get_db
from app.services.auth import get_current_user

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("/stats", response_model=DashboardStats)
async def dashboard_stats(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):

    total = await db.scalar(select(func.count()).select_from(Project).where(Project.owner_id == user.id))
    completed = await db.scalar(
        select(func.count()).select_from(Project).where(
            Project.owner_id == user.id, Project.status == ProjectStatus.COMPLETED
        )
    )
    active = await db.scalar(
        select(func.count()).select_from(AgentRun).join(Project).where(
            Project.owner_id == user.id, AgentRun.status == AgentStatus.RUNNING
        )
    )
    docs = await db.scalar(select(func.count()).select_from(Document).where(Document.owner_id == user.id))
    return DashboardStats(
        total_projects=total or 0,
        completed_projects=completed or 0,
        active_agents=active or 0,
        total_documents=docs or 0,
    )


@router.get("", response_model=list[ProjectResponse])
async def list_projects(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Project).where(Project.owner_id == user.id).order_by(Project.created_at.desc())
    )
    return [ProjectResponse.model_validate(p) for p in result.scalars().all()]


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    data: ProjectCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    project = Project(owner_id=user.id, **data.model_dump())
    db.add(project)
    await db.flush()

    for i, agent in enumerate(AGENT_DEFINITIONS):
        db.add(AgentRun(
            project_id=project.id,
            agent_key=agent["key"],
            agent_name=agent["name"],
            order_index=i,
        ))
    await db.flush()
    await db.refresh(project)
    return ProjectResponse.model_validate(project)


@router.get("/{project_id}", response_model=ProjectDetailResponse)
async def get_project(
    project_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Project)
        .where(Project.id == project_id, Project.owner_id == user.id)
        .options(selectinload(Project.agent_runs), selectinload(Project.report))
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return ProjectDetailResponse(
        **ProjectResponse.model_validate(project).model_dump(),
        agent_runs=[AgentRunResponse.model_validate(r) for r in sorted(project.agent_runs, key=lambda x: x.order_index)],
        report=ReportResponse.model_validate(project.report) if project.report else None,
    )


@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: UUID,
    data: ProjectUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Project).where(Project.id == project_id, Project.owner_id == user.id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(project, key, value)
    await db.flush()
    await db.refresh(project)
    return ProjectResponse.model_validate(project)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Project).where(Project.id == project_id, Project.owner_id == user.id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    await db.delete(project)


@router.get("/{project_id}/report", response_model=ReportResponse)
async def get_report(
    project_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Report).join(Project).where(Report.project_id == project_id, Project.owner_id == user.id)
    )
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return ReportResponse.model_validate(report)
