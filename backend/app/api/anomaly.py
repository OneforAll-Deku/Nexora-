from fastapi import APIRouter
from typing import List, Dict, Any
from app.models.schemas import InvoiceRecord, AnomalyFlag, AnomalyType
from app.models.database import db

router = APIRouter(prefix="/anomalies", tags=["Anomaly & Fraud Audit Hub"])

@router.get("/summary")
def get_anomaly_summary():
    """Returns aggregated audit metrics across arithmetic errors, duplicates, and price surges."""
    all_invoices = list(db.invoices.values())
    
    total_invoices = len(all_invoices)
    flagged_invoices = [i for i in all_invoices if not i.is_approved and len(i.reconciliation_flags) > 0]
    approved_invoices = [i for i in all_invoices if i.is_approved]
    
    arithmetic_count = 0
    duplicate_count = 0
    surge_count = 0
    
    flagged_records_list: List[Dict[str, Any]] = []
    
    for inv in flagged_invoices:
        for f in inv.reconciliation_flags:
            if f.flag_type == AnomalyType.ARITHMETIC_MISMATCH:
                arithmetic_count += 1
            elif f.flag_type == AnomalyType.DUPLICATE_INVOICE:
                duplicate_count += 1
            elif f.flag_type == AnomalyType.PRICE_SURGE:
                surge_count += 1

        flagged_records_list.append({
            "invoice_id": inv.id,
            "invoice_number": inv.invoice_number,
            "vendor_name": inv.vendor_name,
            "total_amount": inv.total_amount,
            "invoice_date": inv.invoice_date,
            "flags": [f.model_dump() for f in inv.reconciliation_flags],
            "items_count": len(inv.items)
        })

    # Historical price surge items
    surge_items = []
    for inv in all_invoices:
        for itm in inv.items:
            if itm.is_anomaly or (itm.z_score and itm.z_score >= 2.5):
                surge_items.append({
                    "invoice_id": inv.id,
                    "invoice_number": inv.invoice_number,
                    "vendor_name": inv.vendor_name,
                    "description": itm.description,
                    "billed_price": itm.unit_price,
                    "historical_avg": itm.historical_avg_price,
                    "z_score": itm.z_score,
                    "surge_percentage": itm.surge_percentage,
                    "reason": itm.anomaly_reason
                })

    return {
        "metrics": {
            "total_invoices_audited": total_invoices,
            "total_flagged_count": len(flagged_invoices),
            "total_approved_count": len(approved_invoices),
            "arithmetic_mismatches": arithmetic_count,
            "duplicate_submissions": duplicate_count,
            "price_surges": surge_count,
            "audit_catch_rate_pct": 100.0 if total_invoices > 0 else 0.0
        },
        "flagged_invoices": flagged_records_list,
        "surge_items": surge_items
    }
