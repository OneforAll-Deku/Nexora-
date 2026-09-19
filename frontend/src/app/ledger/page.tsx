'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ReceiptText, 
  Search, 
  CheckCircle2, 
  ShieldAlert, 
  Clock, 
  ArrowRight, 
  FileSpreadsheet, 
  FileText, 
  Loader2 
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { InvoiceRecord } from '@/lib/types';
import { generateMasterExcelWorkbook } from '@/lib/excelExport';
import { exportGeneralLedgerCSV } from '@/lib/csvExport';
import { ERPLayout } from '@/components/layout/ERPLayout';

export default function LedgerPage() {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'flagged' | 'approved'>('all');
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getInvoices(statusFilter === 'all' ? undefined : statusFilter);
      setInvoices(data);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const q = searchQuery.toLowerCase();
    return (
      inv.vendor_name.toLowerCase().includes(q) ||
      inv.invoice_number.toLowerCase().includes(q) ||
      (inv.tax_id && inv.tax_id.toLowerCase().includes(q))
    );
  });

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      await generateMasterExcelWorkbook(filteredInvoices);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = () => {
    exportGeneralLedgerCSV(filteredInvoices);
  };

  return (
    <ERPLayout>
      <div className="space-y-6 font-body">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-wider mb-1.5">
              <ReceiptText className="w-4 h-4" />
              <span>Accounts Payable General Ledger</span>
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">Invoice Ledger &amp; Line Items</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Central repository of extracted invoices, line-item pricing baselines, and approval status.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportExcel}
              disabled={isExporting || filteredInvoices.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-background hover:bg-secondary border border-border text-xs font-semibold text-emerald-700 transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Multi-Tab Excel (.xlsx)</span>
            </button>

            <button
              onClick={handleExportCSV}
              disabled={filteredInvoices.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-background hover:bg-secondary border border-border text-xs font-semibold text-accent transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>QBO/Xero CSV</span>
            </button>
          </div>
        </div>

        <div className="bg-background rounded-3xl p-4 border border-border shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by vendor, invoice #, or Tax ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-secondary border border-border rounded-full pl-10 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-secondary p-1 rounded-full border border-border w-full md:w-auto overflow-x-auto">
            {(['all', 'flagged', 'pending', 'approved'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === tab
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'all' ? 'All Invoices' : tab === 'flagged' ? 'Action Needed' : tab}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-background rounded-3xl overflow-hidden border border-border shadow-sm">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin text-accent" />
              <p className="text-xs">Loading ledger entries...</p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground text-xs">
              No matching invoice records found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-secondary/60 text-muted-foreground uppercase tracking-wider font-semibold border-b border-border">
                  <tr>
                    <th className="p-4">Invoice #</th>
                    <th className="p-4">Vendor Name</th>
                    <th className="p-4">Invoice Date</th>
                    <th className="p-4">Line Items</th>
                    <th className="p-4 text-right">Subtotal</th>
                    <th className="p-4 text-right">Tax</th>
                    <th className="p-4 text-right">Grand Total</th>
                    <th className="p-4 text-center">Audit Status</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredInvoices.map((inv) => {
                    const hasFlags = inv.reconciliation_flags.length > 0;
                    return (
                      <tr key={inv.id} className="hover:bg-secondary/40 transition-colors">
                        <td className="p-4 font-mono font-bold text-foreground">
                          {inv.invoice_number}
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-foreground">{inv.vendor_name}</div>
                          <div className="text-[11px] text-muted-foreground font-mono">{inv.tax_id || 'No Tax ID'}</div>
                        </td>
                        <td className="p-4 text-muted-foreground font-mono">
                          {inv.invoice_date}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {inv.items.length} item{inv.items.length === 1 ? '' : 's'}
                        </td>
                        <td className="p-4 text-right font-mono text-muted-foreground">
                          ${inv.subtotal.toFixed(2)}
                        </td>
                        <td className="p-4 text-right font-mono text-muted-foreground">
                          ${inv.tax_amount.toFixed(2)}
                        </td>
                        <td className="p-4 text-right font-mono font-bold text-foreground">
                          ${inv.total_amount.toFixed(2)}
                        </td>
                        <td className="p-4 text-center">
                          {inv.is_approved ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" /> Approved
                            </span>
                          ) : hasFlags ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-700 border border-rose-500/20">
                              <ShieldAlert className="w-3 h-3" /> {inv.reconciliation_flags.length} Flags
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/20">
                              <Clock className="w-3 h-3" /> Pending
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <Link
                            href={`/review/${inv.id}`}
                            className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 text-xs font-semibold transition-all"
                          >
                            <span>Review</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ERPLayout>
  );
}
