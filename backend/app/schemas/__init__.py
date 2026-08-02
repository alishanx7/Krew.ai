from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


# Auth
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str = Field(min_length=2)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    full_name: str | None = None
    company: str | None = None
    role: str | None = None
    avatar_url: str | None = None
    theme: str | None = None


class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    full_name: str
    company: str | None = None
    role: str | None = None
    avatar_url: str | None = None
    theme: str = "dark"
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class ApiKeyUpdate(BaseModel):
    fireworks_api_key: str | None = None


# Projects
class ProjectCreate(BaseModel):
    business_name: str = Field(min_length=2)
    industry: str
    problem_statement: str = Field(min_length=10)
    goals: str = Field(min_length=10)
    budget: str
    deadline: str


class ProjectUpdate(BaseModel):
    business_name: str | None = None
    industry: str | None = None
    problem_statement: str | None = None
    goals: str | None = None
    budget: str | None = None
    deadline: str | None = None


class ProjectResponse(BaseModel):
    id: UUID
    business_name: str
    industry: str
    problem_statement: str
    goals: str
    budget: str
    deadline: str
    status: str
    document_context: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

    @classmethod
    def model_validate(cls, obj, **kwargs):
        if hasattr(obj, "status") and hasattr(obj.status, "value"):
            obj = type("_Wrap", (), {**{k: getattr(obj, k) for k in [
                "id", "business_name", "industry", "problem_statement", "goals",
                "budget", "deadline", "document_context", "created_at", "updated_at",
            ], "status": obj.status.value})()
        return super().model_validate(obj, **kwargs)


class AgentRunResponse(BaseModel):
    id: UUID
    agent_key: str
    agent_name: str
    status: str
    output: str | None = None
    error: str | None = None
    order_index: int
    started_at: datetime | None = None
    completed_at: datetime | None = None

    model_config = {"from_attributes": True}


class ReportResponse(BaseModel):
    id: UUID
    project_id: UUID
    executive_summary: str
    market_analysis: str
    competitor_analysis: str
    business_strategy: str
    marketing_plan: str
    financial_projection: str
    technical_architecture: str
    roadmap: str
    risks: str
    recommendations: str
    next_steps: str
    scores: dict
    chart_data: dict
    timeline: list
    created_at: datetime

    model_config = {"from_attributes": True}


class ProjectDetailResponse(ProjectResponse):
    agent_runs: list[AgentRunResponse] = []
    report: ReportResponse | None = None


class DocumentResponse(BaseModel):
    id: UUID
    filename: str
    file_type: str
    file_size: int
    project_id: UUID | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class DashboardStats(BaseModel):
    total_projects: int
    completed_projects: int
    active_agents: int
    total_documents: int
