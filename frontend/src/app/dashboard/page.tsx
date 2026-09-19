'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  UploadCloud, 
  ShieldAlert, 
  ArrowRight, 
  Loader2, 
  Cpu,
  Building2
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { InvoiceRecord, AnomalySummary } from '@/lib/types';
import { AnalyticsCharts } from '@/components/dashboard/AnalyticsCharts';
import { ERPLayout } from '@/components/layout/ERPLayout';

export default function ERPDashboardPage() {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [anomalySummary, setAnomalySummary] = useState<AnomalySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [invs, anomalies] = await Promise.all([
          apiClient.getInvoices(),
          apiClient.getAnomalySummary().catch(() => null)
        ]);
        setInvoices(invs);
        setAnomalySummary(anomalies);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <ERPLayout>
        <div className="h-[70vh] flex items-center justify-center text-muted-foreground gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <p className="text-sm font-medium font-body">Loading AP Intelligence ERP...</p>
        </div>
      </ERPLayout>
    );
  }

  const flaggedInvoices = invoices.filter((i) => !i.is_approved && i.reconciliation_flags.length > 0);
  const pendingInvoices = invoices.filter((i) => !i.is_approved);

  return (
    <ERPLayout>
      <div className="space-y-8 font-body">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-background border border-border rounded-3xl p-8 shadow-sm relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-wider">
              <Cpu className="w-4 h-4" />
              <span>Autonomous Document Intelligence</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground tracking-tight">
              Accounts Payable &amp; Price Anomaly Command Center
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Multimodal OCR extraction with Gemini 2.5 Flash, automated fraud detection, and statistical $Z$-score unit-price surge auditing.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3 shrink-0">
            <Link
              href="/staging"
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-sm shadow-sm transition-transform active:scale-95"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Batch Upload Files</span>
            </Link>
          </div>
        </div>

        <AnalyticsCharts invoices={invoices} anomalySummary={anomalySummary} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-background rounded-3xl p-6 border border-border shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-lg font-display font-bold text-foreground">Reconciliation Action Queue</h3>
                <p className="text-xs text-muted-foreground">Invoices awaiting side-by-side verification and ledger signoff</p>
              </div>
              <Link
                href="/ledger"
                className="text-xs font-semibold text-accent hover:text-accent/80 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-border">
              {pendingInvoices.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-xs">
                  All invoices reconciled and committed to the general ledger!
                </div>
              ) : (
                pendingInvoices.slice(0, 5).map((inv) => {
                  const hasFlags = inv.reconciliation_flags.length > 0;
                  return (
                    <div key={inv.id} className="py-3.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          hasFlags ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20' : 'bg-secondary text-foreground'
                        }`}>
                          {hasFlags ? <ShieldAlert className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-foreground truncate">{inv.vendor_name}</p>
                            <span className="font-mono text-xs text-muted-foreground">#{inv.invoice_number}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Date: {inv.invoice_date} • {inv.items.length} line items
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <p className="text-sm font-mono font-bold text-foreground">${inv.total_amount.toFixed(2)}</p>
                          {hasFlags ? (
                            <span className="text-[10px] font-semibold text-rose-600">
                              {inv.reconciliation_flags.length} Audit Triggers
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-amber-600">
                              Ready for Review
                            </span>
                          )}
                        </div>

                        <Link
                          href={`/review/${inv.id}`}
                          className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 text-xs font-semibold text-foreground transition-all border border-border"
                        >
                          <span>Reconcile</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-background rounded-3xl p-6 border border-border shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <h3 className="text-lg font-display font-bold text-foreground">Audit Watchlist</h3>
              </div>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-700 border border-rose-500/20">
                {flaggedInvoices.length} Flagged
              </span>
            </div>

            <div className="space-y-3">
              {flaggedInvoices.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">No active anomalies detected.</p>
              ) : (
                flaggedInvoices.map((inv) => (
                  <div key={inv.id} className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-rose-900">{inv.vendor_name}</p>
                      <span className="font-mono text-xs text-rose-700 font-bold">${inv.total_amount.toFixed(2)}</span>
                    </div>

                    <p className="text-[11px] text-rose-700 line-clamp-2">
                      {inv.reconciliation_flags[0]?.message}
                    </p>

                    <div className="pt-1 flex justify-end">
                      <Link
                        href={`/review/${inv.id}`}
                        className="text-[11px] font-semibold text-accent hover:text-accent/80 flex items-center gap-1"
                      >
                        <span>Investigate in Workspace</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </ERPLayout>
  );
}
