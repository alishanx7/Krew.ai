import os
from pathlib import Path

from PyPDF2 import PdfReader
from docx import Document as DocxDocument

from app.config import settings


def ensure_upload_dir() -> Path:
    path = Path(settings.upload_dir)
    path.mkdir(parents=True, exist_ok=True)
    return path


def extract_text_from_file(file_path: str, file_type: str) -> str:
    ext = file_type.lower().lstrip(".")
    try:
        if ext == "pdf":
            reader = PdfReader(file_path)
            return "\n".join(page.extract_text() or "" for page in reader.pages)
        if ext in ("docx", "doc"):
            doc = DocxDocument(file_path)
            return "\n".join(p.text for p in doc.paragraphs if p.text.strip())
        if ext in ("txt", "md"):
            with open(file_path, encoding="utf-8", errors="ignore") as f:
                return f.read()
    except Exception as e:
        return f"[Could not extract text: {e}]"
    return ""


def get_file_extension(filename: str) -> str:
    return os.path.splitext(filename)[1].lower().lstrip(".")
