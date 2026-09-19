'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  FileText, 
  Download, 
  X 
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { InvoiceRecord } from '@/lib/types';
import { generateMasterExcelWorkbook } from '@/lib/excelExport';
import { exportGeneralLedgerCSV } from '@/lib/csvExport';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      apiClient.getInvoices()
        .then((res) => setInvoices(res))
        .catch(() => setInvoices([]))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleExcelExport = async () => {
    setIsExporting(true);
    try {
      await generateMasterExcelWorkbook(invoices);
      onClose();
    } catch (err: any) {
      alert(`Excel export failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCSVExport = () => {
    try {
      exportGeneralLedgerCSV(invoices);
      onClose();
    } catch (err: any) {
      alert(`CSV export failed: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm font-body">
      <div className="bg-background border border-border rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-foreground">Document &amp; Ledger Export Center</h3>
              <p className="text-xs text-muted-foreground">Export structured financial workbooks and accounting feeds</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-4 rounded-2xl bg-secondary/60 border border-border flex items-center justify-between text-xs">
            <div>
              <span className="text-muted-foreground">Active Records: </span>
              <span className="font-bold text-foreground">{invoices.length} invoices</span>
            </div>
            <div>
              <span className="text-muted-foreground">Approved: </span>
              <span className="font-bold text-emerald-600">
                {invoices.filter((i) => i.is_approved).length}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Action Needed: </span>
              <span className="font-bold text-rose-600">
                {invoices.filter((i) => !i.is_approved && i.reconciliation_flags.length > 0).length}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={handleExcelExport}
              disabled={isExporting || loading}
              className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 hover:bg-secondary border border-border text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-foreground group-hover:text-emerald-700">
                      Multi-Sheet Excel Workbook (.xlsx)
                    </h4>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700">FR-6.1</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Includes Invoices Summary, Line Items Breakdown, and Audit Discrepancies tabs.
                  </p>
                </div>
              </div>
              <Download className="w-4 h-4 text-muted-foreground group-hover:text-emerald-600 transition-colors" />
            </button>

            <button
              onClick={handleCSVExport}
              disabled={isExporting || loading}
              className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 hover:bg-secondary border border-border text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-foreground group-hover:text-accent">
                      General Ledger CSV Feed
                    </h4>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-accent/15 text-accent">FR-6.2</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Formatted for 1-click import into QuickBooks Online, Xero, and Sage Intacct.
                  </p>
                </div>
              </div>
              <Download className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
            </button>
          </div>
        </div>

        <div className="p-4 bg-secondary/40 border-t border-border text-center">
          <p className="text-[11px] text-muted-foreground">
            Export generated client-side using ExcelJS &amp; PapaParse with zero latency overhead.
          </p>
        </div>
      </div>
    </div>
  );
}
