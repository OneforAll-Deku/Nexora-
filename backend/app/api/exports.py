import io
from fastapi import APIRouter, Response, HTTPException
from fastapi.responses import StreamingResponse
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from app.models.database import db
from app.models.schemas import AnomalyType

router = APIRouter(prefix="/exports", tags=["Tabular & Document Export Engine"])

@router.get("/excel")
def export_excel():
    """
    FR-6.1: Generates multi-tab .xlsx workbook containing:
    1. Invoices Summary (with currency format and status styles)
    2. Line Items Breakdown (itemized table)
    3. Audit & Discrepancies (highlighted soft-red discrepancy rows)
    """
    wb = openpyxl.Workbook()
    # Remove default sheet
    wb.remove(wb.active)

    # Styles
    header_fill = PatternFill(start_color="1E293B", end_color="1E293B", fill_type="solid")
    header_font = Font(name="Arial", size=11, bold=True, color="FFFFFF")
    flag_fill = PatternFill(start_color="FEE2E2", end_color="FEE2E2", fill_type="solid")
    flag_font = Font(name="Arial", size=10, bold=True, color="991B1B")
    border_thin = Border(
        left=Side(style="thin", color="E2E8F0"),
        right=Side(style="thin", color="E2E8F0"),
        top=Side(style="thin", color="E2E8F0"),
        bottom=Side(style="thin", color="E2E8F0")
    )

    # -------------------------------------------------------------
    # Tab 1: Invoices Summary
    # -------------------------------------------------------------
    ws1 = wb.create_sheet(title="Invoices Summary")
    headers1 = ["Invoice ID", "Invoice Number", "Vendor Name", "Tax ID", "Invoice Date", "Due Date", "Currency", "Subtotal", "Tax", "Total Amount", "Approval Status", "Flags Count"]
    ws1.append(headers1)
    
    for col_idx in range(1, len(headers1) + 1):
        cell = ws1.cell(row=1, column=col_idx)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center", vertical="center")

    for row_idx, inv in enumerate(db.invoices.values(), start=2):
        status_text = "Approved" if inv.is_approved else ("Action Needed" if len(inv.reconciliation_flags) > 0 else "Pending")
        ws1.append([
            inv.id,
            inv.invoice_number,
            inv.vendor_name,
            inv.tax_id or "N/A",
            inv.invoice_date,
            inv.due_date or "N/A",
            inv.currency,
            inv.subtotal,
            inv.tax_amount,
            inv.total_amount,
            status_text,
            len(inv.reconciliation_flags)
        ])
        
        # Format currency cells
        ws1.cell(row=row_idx, column=8).number_format = "$#,##0.00"
        ws1.cell(row=row_idx, column=9).number_format = "$#,##0.00"
        ws1.cell(row=row_idx, column=10).number_format = "$#,##0.00"

        # Apply borders
        for c in range(1, len(headers1) + 1):
            ws1.cell(row=row_idx, column=c).border = border_thin

    # -------------------------------------------------------------
    # Tab 2: Line Items Breakdown
    # -------------------------------------------------------------
    ws2 = wb.create_sheet(title="Line Items Breakdown")
    headers2 = ["Invoice Number", "Vendor Name", "Description", "Quantity", "Unit Price", "Total Price", "Historical Avg", "Z-Score", "Surge %", "Anomaly Status"]
    ws2.append(headers2)

    for col_idx in range(1, len(headers2) + 1):
        cell = ws2.cell(row=1, column=col_idx)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center", vertical="center")

    current_row = 2
    for inv in db.invoices.values():
        for itm in inv.items:
            anomaly_str = "FLAGGED SURGE" if itm.is_anomaly else "Normal"
            ws2.append([
                inv.invoice_number,
                inv.vendor_name,
                itm.description,
                itm.quantity,
                itm.unit_price,
                itm.total_price,
                itm.historical_avg_price or "N/A",
                f"{itm.z_score}σ" if itm.z_score is not None else "N/A",
                f"{itm.surge_percentage}%" if itm.surge_percentage is not None else "N/A",
                anomaly_str
            ])
            
            # Format currency
            ws2.cell(row=current_row, column=5).number_format = "$#,##0.00"
            ws2.cell(row=current_row, column=6).number_format = "$#,##0.00"

            if itm.is_anomaly:
                for c in range(1, len(headers2) + 1):
                    ws2.cell(row=current_row, column=c).fill = flag_fill

            for c in range(1, len(headers2) + 1):
                ws2.cell(row=current_row, column=c).border = border_thin
            current_row += 1

    # -------------------------------------------------------------
    # Tab 3: Audit & Discrepancies
    # -------------------------------------------------------------
    ws3 = wb.create_sheet(title="Audit & Discrepancies")
    headers3 = ["Invoice Number", "Vendor Name", "Flag Type", "Severity", "Trigger Field", "Audit Message", "Stated Total"]
    ws3.append(headers3)

    for col_idx in range(1, len(headers3) + 1):
        cell = ws3.cell(row=1, column=col_idx)
        cell.fill = PatternFill(start_color="991B1B", end_color="991B1B", fill_type="solid")
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center", vertical="center")

    current_row = 2
    for inv in db.invoices.values():
        for flag in inv.reconciliation_flags:
            ws3.append([
                inv.invoice_number,
                inv.vendor_name,
                flag.flag_type.value,
                flag.severity.upper(),
                flag.field or "General",
                flag.message,
                inv.total_amount
            ])
            ws3.cell(row=current_row, column=7).number_format = "$#,##0.00"
            for c in range(1, len(headers3) + 1):
                ws3.cell(row=current_row, column=c).fill = flag_fill
                ws3.cell(row=current_row, column=c).border = border_thin
            current_row += 1

    # Auto-adjust column widths
    for sheet in [ws1, ws2, ws3]:
        for col in sheet.columns:
            max_len = max(len(str(cell.value or '')) for cell in col)
            col_letter = openpyxl.utils.get_column_letter(col[0].column)
            sheet.column_dimensions[col_letter].width = max(max_len + 3, 12)

    output = io.BytesIO()
    wb.save(output)
    output.seek(0)

    headers = {
        'Content-Disposition': 'attachment; filename="Invoice_ERP_Master_Export.xlsx"'
    }
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers=headers
    )

@router.get("/csv")
def export_csv():
    """
    FR-6.2: Standard General Ledger CSV formatted for QuickBooks, Xero, and NetSuite.
    """
    import csv
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Headers suitable for QBO / Xero Bills Import
    writer.writerow([
        "InvoiceNumber", "VendorName", "InvoiceDate", "DueDate", "Currency",
        "LineDescription", "Quantity", "UnitPrice", "LineAmount", "TaxAmount", "InvoiceTotal", "Status"
    ])
    
    for inv in db.invoices.values():
        status = "APPROVED" if inv.is_approved else "PENDING"
        if inv.items:
            for itm in inv.items:
                writer.writerow([
                    inv.invoice_number,
                    inv.vendor_name,
                    inv.invoice_date,
                    inv.due_date or "",
                    inv.currency,
                    itm.description,
                    itm.quantity,
                    f"{itm.unit_price:.2f}",
                    f"{itm.total_price:.2f}",
                    f"{inv.tax_amount:.2f}",
                    f"{inv.total_amount:.2f}",
                    status
                ])
        else:
            writer.writerow([
                inv.invoice_number,
                inv.vendor_name,
                inv.invoice_date,
                inv.due_date or "",
                inv.currency,
                "General Services / Items",
                1,
                f"{inv.subtotal:.2f}",
                f"{inv.subtotal:.2f}",
                f"{inv.tax_amount:.2f}",
                f"{inv.total_amount:.2f}",
                status
            ])

    response = Response(content=output.getvalue(), media_type="text/csv")
    response.headers["Content-Disposition"] = 'attachment; filename="General_Ledger_Export.csv"'
    return response

@router.get("/remittance/{invoice_id}")
def get_remittance_slip_data(invoice_id: str):
    """
    FR-6.3: Returns structured remittance voucher data for printable 1-page PDF payment vouchers.
    """
    if invoice_id not in db.invoices:
        raise HTTPException(status_code=404, detail="Invoice record not found.")
    
    inv = db.invoices[invoice_id]
    
    return {
        "voucher_id": f"VCH-{inv.id.replace('inv-', '').upper()}",
        "invoice_number": inv.invoice_number,
        "vendor": {
            "name": inv.vendor_name,
            "tax_id": inv.tax_id or "N/A",
            "payment_terms": "Net 30"
        },
        "invoice_date": inv.invoice_date,
        "due_date": inv.due_date,
        "subtotal": inv.subtotal,
        "tax_amount": inv.tax_amount,
        "total_amount": inv.total_amount,
        "currency": inv.currency,
        "is_approved": inv.is_approved,
        "approved_at": inv.approved_at.isoformat() if inv.approved_at else None,
        "approved_by": inv.approved_by or "Authorized Financial Controller",
        "items": [itm.model_dump() for itm in inv.items],
        "generated_timestamp": db.vendors.get(inv.vendor_id or "")
    }
