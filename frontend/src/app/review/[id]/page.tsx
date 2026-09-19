'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Printer, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { InvoiceRecord } from '@/lib/types';
import { DocumentViewer } from '@/components/review/DocumentViewer';
import { ReconciliationForm } from '@/components/review/ReconciliationForm';
import { RemittanceVoucher } from '@/components/review/RemittanceVoucher';
import { ERPLayout } from '@/components/layout/ERPLayout';

export default function ReviewInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<InvoiceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVoucherOpen, setIsVoucherOpen] = useState(false);

  useEffect(() => {
    if (!invoiceId) return;

    setLoading(true);
    apiClient.getInvoiceById(invoiceId)
      .then((res) => {
        setInvoice(res);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || 'Invoice record not found');
      })
      .finally(() => setLoading(false));
  }, [invoiceId]);

  if (loading) {
    return (
      <ERPLayout>
        <div className="h-[70vh] flex flex-col items-center justify-center gap-3 text-muted-foreground font-body">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <p className="text-sm font-medium">Opening Split-Screen Reconciliation Workspace...</p>
        </div>
      </ERPLayout>
    );
  }

  if (error || !invoice) {
    return (
      <ERPLayout>
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-center font-body">
          <AlertCircle className="w-12 h-12 text-rose-500" />
          <div>
            <h2 className="text-xl font-display font-bold text-foreground">Invoice Record Not Found</h2>
            <p className="text-xs text-muted-foreground mt-1">{error || 'Could not load record'}</p>
          </div>
          <Link
            href="/ledger"
            className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-sm"
          >
            Return to General Ledger
          </Link>
        </div>
      </ERPLayout>
    );
  }

  let resolvedPreviewUrl = invoice.file_url;
  if (!resolvedPreviewUrl || resolvedPreviewUrl.includes('sample_clean')) {
    resolvedPreviewUrl = '/samples/sample_clean.svg';
  } else if (resolvedPreviewUrl.includes('arithmetic')) {
    resolvedPreviewUrl = '/samples/sample_arithmetic_error.svg';
  } else if (resolvedPreviewUrl.includes('surge')) {
    resolvedPreviewUrl = '/samples/sample_surge.svg';
  } else if (resolvedPreviewUrl.includes('duplicate')) {
    resolvedPreviewUrl = '/samples/sample_duplicate.svg';
  }

  return (
    <ERPLayout>
      <div className="space-y-4 flex flex-col h-[calc(100vh-160px)] font-body">
        <div className="flex items-center justify-between shrink-0 bg-background border border-border px-5 py-3 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <Link
              href="/ledger"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Ledger</span>
            </Link>
            <div className="h-4 w-[1px] bg-border" />
            <div className="flex items-center gap-2">
              <span className="text-sm font-display font-bold text-foreground">{invoice.vendor_name}</span>
              <span className="text-xs font-mono text-muted-foreground">#{invoice.invoice_number}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsVoucherOpen(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 border border-border text-xs font-semibold text-foreground transition-all shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-accent" />
              <span>Print Remittance Slip (PDF)</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
          <div className="h-full min-h-[480px]">
            <DocumentViewer fileUrl={resolvedPreviewUrl} fileName={invoice.file_name} />
          </div>

          <div className="h-full min-h-[480px]">
            <ReconciliationForm
              invoice={invoice}
              onApproveSuccess={() => {
                setInvoice({ ...invoice, is_approved: true, reconciliation_flags: [] });
              }}
            />
          </div>
        </div>

        <RemittanceVoucher
          invoice={invoice}
          isOpen={isVoucherOpen}
          onClose={() => setIsVoucherOpen(false)}
        />
      </div>
    </ERPLayout>
  );
}
