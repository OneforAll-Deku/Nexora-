import Papa from 'papaparse';
import { InvoiceRecord } from './types';

export function exportGeneralLedgerCSV(invoices: InvoiceRecord[]): void {
  const rows: any[] = [];

  invoices.forEach((inv) => {
    const status = inv.is_approved ? 'APPROVED' : (inv.reconciliation_flags.length > 0 ? 'FLAGGED' : 'PENDING');
    if (inv.items && inv.items.length > 0) {
      inv.items.forEach((item) => {
        rows.push({
          'InvoiceNumber': inv.invoice_number,
          'VendorName': inv.vendor_name,
          'TaxID': inv.tax_id || '',
          'InvoiceDate': inv.invoice_date,
          'DueDate': inv.due_date || '',
          'Currency': inv.currency,
          'LineDescription': item.description,
          'Quantity': item.quantity,
          'UnitPrice': item.unit_price.toFixed(2),
          'LineAmount': item.total_price.toFixed(2),
          'TaxAmount': inv.tax_amount.toFixed(2),
          'InvoiceTotal': inv.total_amount.toFixed(2),
          'ApprovalStatus': status,
          'FlagsCount': inv.reconciliation_flags.length
        });
      });
    } else {
      rows.push({
        'InvoiceNumber': inv.invoice_number,
        'VendorName': inv.vendor_name,
        'TaxID': inv.tax_id || '',
        'InvoiceDate': inv.invoice_date,
        'DueDate': inv.due_date || '',
        'Currency': inv.currency,
        'LineDescription': 'General Invoice Services/Goods',
        'Quantity': 1,
        'UnitPrice': inv.subtotal.toFixed(2),
        'LineAmount': inv.subtotal.toFixed(2),
        'TaxAmount': inv.tax_amount.toFixed(2),
        'InvoiceTotal': inv.total_amount.toFixed(2),
        'ApprovalStatus': status,
        'FlagsCount': inv.reconciliation_flags.length
      });
    }
  });

  const csvString = Papa.unparse(rows);
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `QuickBooks_Xero_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
