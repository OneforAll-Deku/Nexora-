from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import date, datetime, timezone
from enum import Enum

class DocStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FLAGGED = "flagged"
    REJECTED = "rejected"

class AnomalyType(str, Enum):
    ARITHMETIC_MISMATCH = "ARITHMETIC_MISMATCH"
    DUPLICATE_INVOICE = "DUPLICATE_INVOICE"
    PRICE_SURGE = "PRICE_SURGE"
    UNKNOWN_VENDOR = "UNKNOWN_VENDOR"
    DATE_OUT_OF_BOUNDS = "DATE_OUT_OF_BOUNDS"

class AnomalyFlag(BaseModel):
    flag_type: AnomalyType
    severity: str = Field(default="warning", description="warning | critical | info")
    field: Optional[str] = None
    message: str
    details: Optional[Dict[str, Any]] = None

class LineItem(BaseModel):
    id: Optional[str] = None
    description: str
    quantity: float = Field(default=1.0, ge=0)
    unit_price: float = Field(default=0.0, ge=0)
    total_price: float = Field(default=0.0, ge=0)
    item_code: Optional[str] = None
    historical_avg_price: Optional[float] = None
    z_score: Optional[float] = None
    surge_percentage: Optional[float] = None
    is_anomaly: bool = False
    anomaly_reason: Optional[str] = None

class InvoiceExtract(BaseModel):
    vendor_name: str
    tax_id: Optional[str] = None
    invoice_number: str
    invoice_date: str = Field(description="ISO-8601 YYYY-MM-DD")
    due_date: Optional[str] = None
    currency: str = "USD"
    subtotal: float
    tax_amount: float = 0.0
    total_amount: float
    payment_terms: Optional[str] = "Net 30"
    items: List[LineItem] = []
    confidence_score: Optional[float] = 0.95

class InvoiceRecord(BaseModel):
    id: str
    document_id: Optional[str] = None
    vendor_id: Optional[str] = None
    vendor_name: str
    tax_id: Optional[str] = None
    invoice_number: str
    invoice_date: str
    due_date: Optional[str] = None
    currency: str = "USD"
    subtotal: float
    tax_amount: float
    total_amount: float
    is_approved: bool = False
    reconciliation_flags: List[AnomalyFlag] = []
    items: List[LineItem] = []
    file_name: Optional[str] = None
    file_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    approved_at: Optional[datetime] = None
    approved_by: Optional[str] = None

class VendorRecord(BaseModel):
    id: str
    name: str
    tax_id: Optional[str] = None
    payment_terms: str = "Net 30"
    total_invoices_count: int = 0
    total_spend: float = 0.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DocumentRecord(BaseModel):
    id: str
    file_name: str
    file_url: str
    file_size_bytes: int
    content_type: str = "application/pdf"
    status: DocStatus = DocStatus.PENDING
    invoice_id: Optional[str] = None
    raw_ocr_payload: Optional[Dict[str, Any]] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GeminiKeySaveRequest(BaseModel):
    api_key: str
    provider: str = "google"  # "google" or "openrouter"
    model: Optional[str] = None

class SelectModelRequest(BaseModel):
    provider: str  # "google" or "openrouter"
    model: str

class FetchModelsRequest(BaseModel):
    api_key: Optional[str] = None
    provider: str = "google"

class AddCustomModelRequest(BaseModel):
    provider: str = "google"
    model_id: str
    name: Optional[str] = None
    context_length: int = 1048576
    is_vision: bool = True
    is_free_tier: bool = True
    badge: str = "Custom Model"
    description: Optional[str] = None

class GeminiKeyStatusResponse(BaseModel):
    provider: str = "google"
    is_configured: bool
    is_valid: bool
    mask: str
    model: str = "gemini-2.5-flash"
    gemini_model: str = "gemini-2.5-flash"
    openrouter_model: str = "meta-llama/llama-3.3-70b-instruct"
    google_configured: bool = False
    google_mask: str = "Not Configured"
    openrouter_configured: bool = False
    openrouter_mask: str = "Not Configured"
    available_gemini_models: List[Dict[str, Any]] = []
    available_open_source_models: List[Dict[str, Any]] = []
    message: Optional[str] = None

class IngestionResponse(BaseModel):
    document: DocumentRecord
    invoice: Optional[InvoiceRecord] = None
    processing_time_seconds: float
    flags_count: int = 0

class LedgerApprovalRequest(BaseModel):
    invoice_id: str
    approved_by: str = "Controller / AP Lead"
    updated_invoice: Optional[InvoiceExtract] = None
