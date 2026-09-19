import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.models.schemas import (
    InvoiceRecord, InvoiceExtract, LedgerApprovalRequest,
    VendorRecord, LineItem
)
from app.models.database import db
from app.services.audit_service import audit_service

router = APIRouter(prefix="/invoices", tags=["Invoices Ledger"])

@router.get("", response_model=List[InvoiceRecord])
@router.get("/", response_model=List[InvoiceRecord])
def get_invoices(
    status: Optional[str] = Query(None, description="all | pending | approved | flagged"),
    vendor_id: Optional[str] = Query(None)
):
    """Retrieves all invoice ledger records with optional status filtering."""
    results = list(db.invoices.values())
    
    if status == "pending":
        results = [i for i in results if not i.is_approved and len(i.reconciliation_flags) == 0]
    elif status == "flagged":
        results = [i for i in results if not i.is_approved and len(i.reconciliation_flags) > 0]
    elif status == "approved":
        results = [i for i in results if i.is_approved]
        
    if vendor_id:
        results = [i for i in results if i.vendor_id == vendor_id]

    # Sort newest first
    results.sort(key=lambda x: x.invoice_date or "2000-01-01", reverse=True)
    return results

@router.get("/{invoice_id}", response_model=InvoiceRecord)
def get_invoice(invoice_id: str):
    """Fetches full invoice record including granular line items and reconciliation flags."""
    if invoice_id not in db.invoices:
        raise HTTPException(status_code=404, detail="Invoice record not found.")
    return db.invoices[invoice_id]

@router.put("/{invoice_id}", response_model=InvoiceRecord)
def update_invoice(invoice_id: str, updated_data: InvoiceExtract):
    """Updates extracted fields during reconciliation and re-runs anomaly audit."""
    if invoice_id not in db.invoices:
        raise HTTPException(status_code=404, detail="Invoice record not found.")
    
    existing = db.invoices[invoice_id]
    
    # Re-audit with updated fields
    flags, audited_items = audit_service.audit_invoice(
        updated_data,
        vendor_id=existing.vendor_id,
        exclude_invoice_id=invoice_id
    )
    
    existing.vendor_name = updated_data.vendor_name
    existing.tax_id = updated_data.tax_id
    existing.invoice_number = updated_data.invoice_number
    existing.invoice_date = updated_data.invoice_date
    existing.due_date = updated_data.due_date
    existing.currency = updated_data.currency
    existing.subtotal = updated_data.subtotal
    existing.tax_amount = updated_data.tax_amount
    existing.total_amount = updated_data.total_amount
    existing.items = audited_items
    existing.reconciliation_flags = flags

    db.invoices[invoice_id] = existing
    return existing

@router.post("/approve", response_model=InvoiceRecord)
def approve_invoice(req: LedgerApprovalRequest):
    """
    FR-5.3: Commits reconciled invoice to the general ledger,
    marks is_approved = True, updates vendor total spend metrics,
    and commits line items to historical analytical baseline.
    """
    if req.invoice_id not in db.invoices:
        raise HTTPException(status_code=404, detail="Invoice record not found.")
    
    inv = db.invoices[req.invoice_id]
    
    # If updated payload sent during approval
    if req.updated_invoice:
        inv.vendor_name = req.updated_invoice.vendor_name
        inv.tax_id = req.updated_invoice.tax_id
        inv.invoice_number = req.updated_invoice.invoice_number
        inv.invoice_date = req.updated_invoice.invoice_date
        inv.due_date = req.updated_invoice.due_date
        inv.subtotal = req.updated_invoice.subtotal
        inv.tax_amount = req.updated_invoice.tax_amount
        inv.total_amount = req.updated_invoice.total_amount
        if req.updated_invoice.items:
            inv.items = req.updated_invoice.items

    inv.is_approved = True
    inv.approved_at = datetime.utcnow()
    inv.approved_by = req.approved_by
    # Clear active blocking flags upon controller authorization
    inv.reconciliation_flags = []

    # Update or create vendor metrics
    vendor_found = False
    for v in db.vendors.values():
        if v.name.strip().lower() == inv.vendor_name.strip().lower():
            v.total_invoices_count += 1
            v.total_spend += inv.total_amount
            inv.vendor_id = v.id
            vendor_found = True
            break
            
    if not vendor_found:
        new_v_id = f"ven-{uuid.uuid4().hex[:6]}"
        db.vendors[new_v_id] = VendorRecord(
            id=new_v_id,
            name=inv.vendor_name,
            tax_id=inv.tax_id,
            payment_terms="Net 30",
            total_invoices_count=1,
            total_spend=inv.total_amount
        )
        inv.vendor_id = new_v_id

    db.invoices[req.invoice_id] = inv
    return inv

@router.get("/vendors/list", response_model=List[VendorRecord])
def get_vendors():
    """Returns list of vendors and historical spend aggregates."""
    return list(db.vendors.values())
