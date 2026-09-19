from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query
from typing import List, Optional
from app.models.schemas import DocumentRecord, IngestionResponse
from app.models.database import db
from app.services.ocr_service import ocr_service
from app.services.storage_service import storage_service

router = APIRouter(prefix="/documents", tags=["Document Ingestion"])

@router.get("/presigned-url")
def get_presigned_url(filename: str = Query(...), content_type: str = Query("application/pdf")):
    """FR-2.2: Generates Cloudflare R2 / S3 presigned PUT URL for direct client streaming."""
    return storage_service.get_presigned_upload_url(filename, content_type)

@router.post("/upload-and-process", response_model=IngestionResponse)
async def upload_and_process(
    file: UploadFile = File(...),
    custom_key: Optional[str] = Form(None)
):
    """
    Ingests document file, performs multimodal extraction via Gemini 2.5 Flash,
    and runs anomaly & price surge audit.
    """
    try:
        file_bytes = await file.read()
        if len(file_bytes) == 0:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        response = ocr_service.process_document(
            file_bytes=file_bytes,
            filename=file.filename or "uploaded_invoice.pdf",
            content_type=file.content_type or "application/pdf",
            custom_key=custom_key
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Document processing failed: {str(e)}")

@router.get("/queue", response_model=List[DocumentRecord])
def get_document_queue():
    """Returns list of documents in processing queue."""
    return sorted(db.documents.values(), key=lambda d: d.created_at, reverse=True)
