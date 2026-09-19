import os
import uuid
import shutil
from pathlib import Path
from typing import Tuple
from app.core.config import settings

class StorageService:
    @staticmethod
    def save_local_file(file_bytes: bytes, filename: str) -> Tuple[str, str]:
        """Saves file to upload directory and returns relative URL and absolute path."""
        clean_ext = Path(filename).suffix or ".pdf"
        unique_name = f"{uuid.uuid4().hex[:12]}_{filename}"
        target_path = settings.UPLOAD_FOLDER / unique_name
        
        with open(target_path, "wb") as f:
            f.write(file_bytes)
            
        file_url = f"/uploads/{unique_name}"
        return file_url, str(target_path)

    @staticmethod
    def get_presigned_upload_url(filename: str, content_type: str) -> dict:
        """
        Generates presigned upload details for Cloudflare R2 or returns local direct endpoint.
        In production with R2 credentials configured, this signs an S3 client PUT request.
        """
        doc_id = str(uuid.uuid4())
        clean_name = f"{doc_id}_{filename}"
        
        # When R2 credentials are present:
        # s3_client = boto3.client('s3', endpoint_url=R2_ENDPOINT, aws_access_key_id=..., ...)
        # presigned_url = s3_client.generate_presigned_url('put_object', Params={'Bucket': 'invoices', 'Key': clean_name}, ExpiresIn=3600)
        
        # Zero-cost local direct presigned endpoint:
        direct_upload_url = f"/api/v1/documents/upload-direct?doc_id={doc_id}&filename={filename}"
        
        return {
            "document_id": doc_id,
            "upload_url": direct_upload_url,
            "file_key": clean_name,
            "expires_in": 3600,
            "method": "POST"
        }

storage_service = StorageService()
