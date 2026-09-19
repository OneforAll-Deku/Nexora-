'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, 
  TrendingUp, 
  AlertOctagon, 
  Copy, 
  Calculator, 
  ArrowRight, 
  Loader2, 
  Zap 
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { AnomalySummary } from '@/lib/types';
import { ERPLayout } from '@/components/layout/ERPLayout';

export default function AnomaliesPage() {
  const [summary, setSummary] = useState<AnomalySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.getAnomalySummary()
      .then((res) => setSummary(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <ERPLayout>
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <p className="text-sm font-medium font-body">Running statistical anomaly scan...</p>
        </div>
      </ERPLayout>
    );
  }

  const metrics = summary?.metrics || {
    total_invoices_audited: 0,
    total_flagged_count: 0,
    total_approved_count: 0,
    arithmetic_mismatches: 0,
    duplicate_submissions: 0,
    price_surges: 0,
    audit_catch_rate_pct: 100.0
  };

  return (
    <ERPLayout>
      <div className="space-y-8 font-body">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-wider mb-1.5">
            <ShieldAlert className="w-4 h-4" />
            <span>Automated Fraud &amp; Price Surge Audit Engine</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">Audit &amp; Anomaly Hub</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-3xl leading-relaxed">
            Continuous auditing for duplicate billings, invoice arithmetic discrepancies (&Delta; &gt; $0.05), and statistical $Z$-score unit-price surges (&ge; 2.5&sigma;).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-background rounded-3xl p-6 border border-border shadow-sm border-t-4 border-t-rose-500 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-rose-600" />
                <h3 className="text-sm font-bold text-foreground">Arithmetic Sanity (FR-4.1)</h3>
              </div>
              <span className="font-display text-2xl font-bold text-rose-600">
                {metrics.arithmetic_mismatches}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Formula: &Delta; = |(&sum; items + tax) - total|. Flags if discrepancy &gt; $0.05.
            </p>
          </div>

          <div className="bg-background rounded-3xl p-6 border border-border shadow-sm border-t-4 border-t-purple-500 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Copy className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm font-bold text-foreground">Duplicate Detection (FR-4.2)</h3>
              </div>
              <span className="font-display text-2xl font-bold text-purple-600">
                {metrics.duplicate_submissions}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Flags matching (vendor_id, invoice_number) across active or previously approved ledger entries.
            </p>
          </div>

          <div className="bg-background rounded-3xl p-6 border border-border shadow-sm border-t-4 border-t-amber-500 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold text-foreground">Price Surge Z-Score (FR-4.3)</h3>
              </div>
              <span className="font-display text-2xl font-bold text-amber-600">
                {metrics.price_surges}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Formula: Z = (Price - &mu;) / &sigma; &ge; 2.5&sigma;. Flags price spikes over vendor history.
            </p>
          </div>
        </div>

        <div className="bg-background rounded-3xl p-6 border border-border shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="text-lg font-display font-bold text-foreground">Statistical Price Surge Outliers (Z &ge; 2.5&sigma;)</h3>
                <p className="text-xs text-muted-foreground">Line items billed significantly higher than established historical baseline</p>
              </div>
            </div>
          </div>

          {(!summary?.surge_items || summary.surge_items.length === 0) ? (
            <div className="py-8 text-center text-muted-foreground text-xs">No price surge outliers detected.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-secondary/60 text-muted-foreground uppercase font-semibold border-b border-border">
                  <tr>
                    <th className="p-3">Vendor</th>
                    <th className="p-3">Item Description</th>
                    <th className="p-3 text-right">Billed Unit Price</th>
                    <th className="p-3 text-right">Historical Baseline (&mu;)</th>
                    <th className="p-3 text-center">Z-Score</th>
                    <th className="p-3 text-center">Surge %</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {summary.surge_items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-secondary/40 transition-colors">
                      <td className="p-3 font-semibold text-foreground">{item.vendor_name}</td>
                      <td className="p-3 text-muted-foreground max-w-xs truncate">{item.description}</td>
                      <td className="p-3 text-right font-mono font-bold text-amber-700">
                        ${item.billed_price.toFixed(2)}
                      </td>
                      <td className="p-3 text-right font-mono text-muted-foreground">
                        ${item.historical_avg?.toFixed(2) || 'N/A'}
                      </td>
                      <td className="p-3 text-center">
                        <span className="font-mono font-bold text-xs text-rose-700 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                          +{item.z_score}&sigma;
                        </span>
                      </td>
                      <td className="p-3 text-center font-bold text-amber-700 font-mono">
                        +{item.surge_percentage}%
                      </td>
                      <td className="p-3 text-center">
                        <Link
                          href={`/review/${item.invoice_id}`}
                          className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent/80 font-semibold"
                        >
                          <span>Investigate</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-background rounded-3xl p-6 border border-border shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-rose-600" />
              <div>
                <h3 className="text-lg font-display font-bold text-foreground">Invoices Flagged for Controller Review</h3>
                <p className="text-xs text-muted-foreground">Invoices blocked from auto-approval pending manual reconciliation</p>
              </div>
            </div>
          </div>

          {(!summary?.flagged_invoices || summary.flagged_invoices.length === 0) ? (
            <div className="py-8 text-center text-muted-foreground text-xs">No invoices currently flagged.</div>
          ) : (
            <div className="space-y-3">
              {summary.flagged_invoices.map((inv) => (
                <div
                  key={inv.invoice_id}
                  className="p-4 rounded-2xl bg-secondary/50 border border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-sm">{inv.vendor_name}</span>
                      <span className="font-mono text-xs text-muted-foreground">#{inv.invoice_number}</span>
                      <span className="text-xs text-muted-foreground">({inv.invoice_date})</span>
                    </div>

                    <div className="space-y-1">
                      {inv.flags.map((f, i) => (
                        <p key={i} className="text-xs text-rose-600 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
                          <span>{f.message}</span>
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground block">Stated Total</span>
                      <span className="font-mono font-bold text-foreground text-sm">${inv.total_amount.toFixed(2)}</span>
                    </div>

                    <Link
                      href={`/review/${inv.invoice_id}`}
                      className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-sm transition-transform active:scale-95"
                    >
                      <span>Reconciliation Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ERPLayout>
  );
}
