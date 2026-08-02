from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User
from app.schemas import ApiKeyUpdate, UserResponse, UserUpdate
from app.services.auth import get_current_user

router = APIRouter(prefix="/settings", tags=["settings"])


@router.patch("/profile", response_model=UserResponse)
async def update_profile(
    data: UserUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(user, key, value)
    await db.flush()
    await db.refresh(user)
    return UserResponse.model_validate(user)


@router.patch("/api-key", response_model=UserResponse)
async def update_api_key(
    data: ApiKeyUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user.fireworks_api_key = data.fireworks_api_key
    await db.flush()
    await db.refresh(user)
    return UserResponse.model_validate(user)
