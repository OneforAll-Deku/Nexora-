import ExcelJS from 'exceljs';
import { InvoiceRecord } from './types';

export async function generateMasterExcelWorkbook(invoices: InvoiceRecord[]): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Intelligent Document ERP (BYOK)';
  workbook.created = new Date();

  const headerFont: Partial<ExcelJS.Font> = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  const headerFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0F172A' }
  };
  const flagHeaderFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF991B1B' }
  };
  const softRedFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFEE2E2' }
  };
  const softGreenFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFDCFCE7' }
  };
  const borderThin: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
  };

  const ws1 = workbook.addWorksheet('Invoices Summary', {
    views: [{ showGridLines: true }]
  });

  ws1.columns = [
    { header: 'Invoice Number', key: 'invoice_number', width: 18 },
    { header: 'Vendor Name', key: 'vendor_name', width: 28 },
    { header: 'Tax ID', key: 'tax_id', width: 20 },
    { header: 'Invoice Date', key: 'invoice_date', width: 14 },
    { header: 'Due Date', key: 'due_date', width: 14 },
    { header: 'Currency', key: 'currency', width: 10 },
    { header: 'Subtotal', key: 'subtotal', width: 16 },
    { header: 'Tax Amount', key: 'tax_amount', width: 14 },
    { header: 'Total Amount', key: 'total_amount', width: 16 },
    { header: 'Status', key: 'status', width: 16 },
    { header: 'Audit Flags', key: 'flags', width: 14 }
  ];

  ws1.getRow(1).height = 28;
  ws1.getRow(1).eachCell((cell) => {
    cell.font = headerFont;
    cell.fill = headerFill;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  invoices.forEach((inv) => {
    const row = ws1.addRow({
      invoice_number: inv.invoice_number,
      vendor_name: inv.vendor_name,
      tax_id: inv.tax_id || 'N/A',
      invoice_date: inv.invoice_date,
      due_date: inv.due_date || 'N/A',
      currency: inv.currency,
      subtotal: inv.subtotal,
      tax_amount: inv.tax_amount,
      total_amount: inv.total_amount,
      status: inv.is_approved ? 'Approved' : (inv.reconciliation_flags.length > 0 ? 'Review Needed' : 'Pending'),
      flags: inv.reconciliation_flags.length
    });

    row.height = 22;
    row.getCell('subtotal').numFmt = '$#,##0.00';
    row.getCell('tax_amount').numFmt = '$#,##0.00';
    row.getCell('total_amount').numFmt = '$#,##0.00';

    const statusCell = row.getCell('status');
    if (inv.is_approved) {
      statusCell.fill = softGreenFill;
      statusCell.font = { color: { argb: 'FF166534' }, bold: true };
    } else if (inv.reconciliation_flags.length > 0) {
      statusCell.fill = softRedFill;
      statusCell.font = { color: { argb: 'FF991B1B' }, bold: true };
    }

    row.eachCell((cell) => {
      cell.border = borderThin;
      if (!cell.alignment) {
        cell.alignment = { vertical: 'middle' };
      }
    });
  });

  const ws2 = workbook.addWorksheet('Line Items Breakdown', {
    views: [{ showGridLines: true }]
  });

  ws2.columns = [
    { header: 'Invoice #', key: 'invoice_number', width: 18 },
    { header: 'Vendor Name', key: 'vendor_name', width: 26 },
    { header: 'Item Description', key: 'description', width: 36 },
    { header: 'Qty', key: 'quantity', width: 10 },
    { header: 'Unit Price', key: 'unit_price', width: 14 },
    { header: 'Total Price', key: 'total_price', width: 16 },
    { header: 'Hist. Baseline', key: 'historical_avg', width: 14 },
    { header: 'Z-Score', key: 'z_score', width: 12 },
    { header: 'Price Surge %', key: 'surge_pct', width: 14 },
    { header: 'Audit Status', key: 'status', width: 18 }
  ];

  ws2.getRow(1).height = 28;
  ws2.getRow(1).eachCell((cell) => {
    cell.font = headerFont;
    cell.fill = headerFill;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  invoices.forEach((inv) => {
    inv.items.forEach((item) => {
      const row = ws2.addRow({
        invoice_number: inv.invoice_number,
        vendor_name: inv.vendor_name,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        historical_avg: item.historical_avg_price ? `$${item.historical_avg_price.toFixed(2)}` : 'N/A',
        z_score: item.z_score !== undefined && item.z_score !== null ? `${item.z_score}σ` : 'N/A',
        surge_pct: item.surge_percentage ? `+${item.surge_percentage}%` : 'N/A',
        status: item.is_anomaly ? 'FLAGGED SURGE' : 'Normal'
      });

      row.height = 22;
      row.getCell('unit_price').numFmt = '$#,##0.00';
      row.getCell('total_price').numFmt = '$#,##0.00';

      if (item.is_anomaly) {
        row.eachCell((c) => {
          c.fill = softRedFill;
        });
        row.getCell('status').font = { color: { argb: 'FF991B1B' }, bold: true };
      }

      row.eachCell((cell) => {
        cell.border = borderThin;
        cell.alignment = { vertical: 'middle' };
      });
    });
  });

  const ws3 = workbook.addWorksheet('Audit & Discrepancies', {
    views: [{ showGridLines: true }]
  });

  ws3.columns = [
    { header: 'Invoice #', key: 'invoice_number', width: 18 },
    { header: 'Vendor Name', key: 'vendor_name', width: 24 },
    { header: 'Anomaly Type', key: 'flag_type', width: 22 },
    { header: 'Severity', key: 'severity', width: 14 },
    { header: 'Trigger Field', key: 'field', width: 18 },
    { header: 'Detailed Finding & Explanation', key: 'message', width: 60 },
    { header: 'Stated Total', key: 'total_amount', width: 16 }
  ];

  ws3.getRow(1).height = 28;
  ws3.getRow(1).eachCell((cell) => {
    cell.font = headerFont;
    cell.fill = flagHeaderFill;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  invoices.forEach((inv) => {
    inv.reconciliation_flags.forEach((flag) => {
      const row = ws3.addRow({
        invoice_number: inv.invoice_number,
        vendor_name: inv.vendor_name,
        flag_type: flag.flag_type,
        severity: flag.severity.toUpperCase(),
        field: flag.field || 'General',
        message: flag.message,
        total_amount: inv.total_amount
      });

      row.height = 26;
      row.getCell('total_amount').numFmt = '$#,##0.00';
      row.eachCell((c) => {
        c.fill = softRedFill;
        c.border = borderThin;
        c.alignment = { vertical: 'middle' };
      });
      row.getCell('severity').font = { color: { argb: 'FF991B1B' }, bold: true };
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `Invoice_ERP_Master_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
  anchor.click();
  window.URL.revokeObjectURL(url);
}
