'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle2, 
  ShieldAlert, 
  AlertTriangle, 
  Save, 
  Plus, 
  Trash2, 
  Zap, 
  FileCheck 
} from 'lucide-react';
import { InvoiceRecord, LineItem, AnomalyFlag, InvoiceExtract } from '@/lib/types';
import { apiClient } from '@/lib/api';

interface ReconciliationFormProps {
  invoice: InvoiceRecord;
  onApproveSuccess?: () => void;
}

export function ReconciliationForm({ invoice, onApproveSuccess }: ReconciliationFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<InvoiceExtract>({
    vendor_name: invoice.vendor_name,
    tax_id: invoice.tax_id || '',
    invoice_number: invoice.invoice_number,
    invoice_date: invoice.invoice_date,
    due_date: invoice.due_date || '',
    currency: invoice.currency || 'USD',
    subtotal: invoice.subtotal,
    tax_amount: invoice.tax_amount,
    total_amount: invoice.total_amount,
    payment_terms: 'Net 30',
    items: invoice.items || []
  });

  const [flags, setFlags] = useState<AnomalyFlag[]>(invoice.reconciliation_flags || []);
  const [isSaving, setIsSaving] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isApproved, setIsApproved] = useState(invoice.is_approved);

  const handleItemChange = (index: number, field: keyof LineItem, val: any) => {
    const updated = [...formData.items];
    const item = { ...updated[index], [field]: val };
    
    if (field === 'quantity' || field === 'unit_price') {
      const q = field === 'quantity' ? parseFloat(val) || 0 : item.quantity;
      const u = field === 'unit_price' ? parseFloat(val) || 0 : item.unit_price;
      item.total_price = parseFloat((q * u).toFixed(2));
    }
    
    updated[index] = item;
    
    const calculatedSubtotal = updated.reduce((sum, itm) => sum + (itm.total_price || 0), 0);
    const calculatedTotal = parseFloat((calculatedSubtotal + (formData.tax_amount || 0)).toFixed(2));

    setFormData((prev) => ({
      ...prev,
      items: updated,
      subtotal: parseFloat(calculatedSubtotal.toFixed(2)),
      total_amount: calculatedTotal
    }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: `item-${Date.now()}`,
          description: 'New Line Item',
          quantity: 1,
          unit_price: 0,
          total_price: 0
        }
      ]
    }));
  };

  const removeItem = (index: number) => {
    const updated = formData.items.filter((_, i) => i !== index);
    const calculatedSubtotal = updated.reduce((sum, itm) => sum + (itm.total_price || 0), 0);
    setFormData((prev) => ({
      ...prev,
      items: updated,
      subtotal: parseFloat(calculatedSubtotal.toFixed(2)),
      total_amount: parseFloat((calculatedSubtotal + prev.tax_amount).toFixed(2))
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await apiClient.updateInvoice(invoice.id, formData);
      setFlags(updated.reconciliation_flags);
      alert('Invoice reconciliation data saved and re-audited.');
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await apiClient.approveInvoice(invoice.id, 'Financial Controller / Lead', formData);
      setIsApproved(true);
      setFlags([]);
      if (onApproveSuccess) onApproveSuccess();
      alert('Invoice successfully approved and committed to the General Ledger!');
      router.push('/ledger');
    } catch (err: any) {
      alert(`Approval failed: ${err.message}`);
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background rounded-3xl border border-border p-6 overflow-y-auto space-y-6 shadow-sm font-body">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-display font-bold text-foreground">Reconciliation Workspace</h2>
            {isApproved ? (
              <span className="flex items-center gap-1 text-xs font-semibold px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ledger Committed
              </span>
            ) : flags.length > 0 ? (
              <span className="flex items-center gap-1 text-xs font-semibold px-3 py-0.5 rounded-full bg-rose-500/10 text-rose-700 border border-rose-500/30">
                <ShieldAlert className="w-3.5 h-3.5" /> {flags.length} Audit Flags
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-semibold px-3 py-0.5 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/30">
                <AlertTriangle className="w-3.5 h-3.5" /> Review Pending
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cross-check extracted financial fields with original scan before ledger commit
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving || isApproved}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-secondary hover:bg-secondary/80 border border-border text-foreground text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>

          <button
            onClick={handleApprove}
            disabled={isApproving || isApproved}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold shadow-sm transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <FileCheck className="w-4 h-4" />
            <span>{isApproved ? 'Approved to Ledger' : 'Approve to Ledger'}</span>
          </button>
        </div>
      </div>

      {flags.length > 0 && !isApproved && (
        <div className="space-y-2">
          {flags.map((flag, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl border flex items-start gap-3 text-xs leading-relaxed ${
                flag.severity === 'critical'
                  ? 'bg-rose-50/80 border-rose-200 text-rose-800'
                  : 'bg-amber-50/80 border-amber-200 text-amber-800'
              }`}
            >
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 font-semibold">
                  <span className="uppercase tracking-wide text-[10px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-700 border border-rose-500/20">
                    {flag.flag_type}
                  </span>
                  <span>{flag.message}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">Vendor Name</label>
          <input
            type="text"
            value={formData.vendor_name}
            onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
            className="w-full bg-secondary border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">Tax ID / EIN</label>
          <input
            type="text"
            value={formData.tax_id}
            onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
            className="w-full bg-secondary border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">Invoice Number</label>
          <input
            type="text"
            value={formData.invoice_number}
            onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
            className="w-full bg-secondary border border-border rounded-xl px-3.5 py-2 text-xs text-foreground font-mono focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">Invoice Date</label>
          <input
            type="date"
            value={formData.invoice_date}
            onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
            className="w-full bg-secondary border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">Due Date</label>
          <input
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            className="w-full bg-secondary border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">Currency</label>
          <select
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            className="w-full bg-secondary border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="CAD">CAD ($)</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Line Items &amp; Price Surge Analysis</h3>
          <button
            onClick={addItem}
            className="flex items-center gap-1 text-xs text-accent hover:text-accent/80 font-semibold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        </div>

        <div className="border border-border rounded-2xl overflow-hidden bg-background">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/60 text-muted-foreground border-b border-border uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-3">Description</th>
                <th className="p-3 w-20 text-center">Qty</th>
                <th className="p-3 w-28 text-right">Unit Price</th>
                <th className="p-3 w-32 text-right">Total Price</th>
                <th className="p-3 w-40 text-center">Z-Score Surge</th>
                <th className="p-3 w-12 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {formData.items.map((item, idx) => (
                <tr
                  key={idx}
                  className={`hover:bg-secondary/30 transition-colors ${
                    item.is_anomaly ? 'bg-rose-50/50' : ''
                  }`}
                >
                  <td className="p-2.5">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      className="w-full bg-transparent border-0 text-foreground text-xs focus:ring-0 focus:outline-none"
                    />
                  </td>
                  <td className="p-2.5">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      className="w-full bg-secondary border border-border rounded-lg px-2 py-1 text-xs text-foreground text-center focus:outline-none focus:border-accent"
                    />
                  </td>
                  <td className="p-2.5">
                    <input
                      type="number"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)}
                      className="w-full bg-secondary border border-border rounded-lg px-2 py-1 text-xs text-foreground text-right font-mono focus:outline-none focus:border-accent"
                    />
                  </td>
                  <td className="p-2.5 text-right font-mono font-semibold text-foreground">
                    ${item.total_price?.toFixed(2)}
                  </td>
                  <td className="p-2.5 text-center">
                    {item.is_anomaly ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-700 border border-rose-500/30">
                        <Zap className="w-3 h-3" /> +{item.surge_percentage}% ({item.z_score}σ)
                      </span>
                    ) : (
                      <span className="text-muted-foreground font-mono text-[11px]">Normal Baseline</span>
                    )}
                  </td>
                  <td className="p-2.5 text-center">
                    <button
                      onClick={() => removeItem(idx)}
                      className="text-muted-foreground hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-secondary/50 border border-border space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Subtotal:</span>
          <span className="font-mono text-foreground font-semibold">${formData.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>Tax Amount:</span>
          <div className="w-28">
            <input
              type="number"
              step="0.01"
              value={formData.tax_amount}
              onChange={(e) => {
                const tax = parseFloat(e.target.value) || 0;
                setFormData((prev) => ({
                  ...prev,
                  tax_amount: tax,
                  total_amount: parseFloat((prev.subtotal + tax).toFixed(2))
                }));
              }}
              className="w-full bg-background border border-border rounded-lg px-2 py-1 text-xs text-right text-foreground font-mono focus:outline-none focus:border-accent"
            />
          </div>
        </div>
        <div className="border-t border-border pt-2 flex justify-between items-center text-sm font-bold text-foreground">
          <span>Grand Total:</span>
          <span className="text-base text-accent font-mono font-bold">${formData.total_amount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
