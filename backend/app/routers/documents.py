import uuid
from uuid import UUID

import aiofiles
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models import Document, Project, User
from app.schemas import DocumentResponse
from app.services.auth import get_current_user
from app.services.documents import ensure_upload_dir, extract_text_from_file, get_file_extension

router = APIRouter(prefix="/documents", tags=["documents"])

ALLOWED_EXTENSIONS = {"pdf", "docx", "doc", "txt", "md"}


@router.get("", response_model=list[DocumentResponse])
async def list_documents(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Document).where(Document.owner_id == user.id).order_by(Document.created_at.desc())
    )
    return [DocumentResponse.model_validate(d) for d in result.scalars().all()]


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    project_id: UUID | None = Form(None),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    ext = get_file_extension(file.filename)
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type .{ext} not allowed. Use PDF, Word, or text files.")

    content = await file.read()
    if len(content) > settings.max_upload_size_mb * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"File exceeds {settings.max_upload_size_mb}MB limit")

    if project_id:
        proj = await db.execute(
            select(Project).where(Project.id == project_id, Project.owner_id == user.id)
        )
        if not proj.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Project not found")

    upload_dir = ensure_upload_dir()
    safe_name = f"{uuid.uuid4()}_{file.filename}"
    file_path = upload_dir / safe_name

    async with aiofiles.open(file_path, "wb") as f:
        await f.write(content)

    extracted = extract_text_from_file(str(file_path), ext)

    doc = Document(
        owner_id=user.id,
        project_id=project_id,
        filename=file.filename,
        file_type=ext,
        file_path=str(file_path),
        extracted_text=extracted,
        file_size=len(content),
    )
    db.add(doc)

    if project_id and extracted:
        proj_result = await db.execute(select(Project).where(Project.id == project_id))
        project = proj_result.scalar_one()
        existing = project.document_context or ""
        project.document_context = f"{existing}\n\n--- {file.filename} ---\n{extracted[:5000]}".strip()

    await db.flush()
    await db.refresh(doc)
    return DocumentResponse.model_validate(doc)


@router.delete("/{document_id}", status_code=204)
async def delete_document(
    document_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Document).where(Document.id == document_id, Document.owner_id == user.id)
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    await db.delete(doc)
