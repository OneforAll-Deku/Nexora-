'use client';

import React from 'react';
import { Printer, CheckCircle2, X } from 'lucide-react';
import { InvoiceRecord } from '@/lib/types';

interface RemittanceVoucherProps {
  invoice: InvoiceRecord;
  isOpen: boolean;
  onClose: () => void;
}

export function RemittanceVoucher({ invoice, isOpen, onClose }: RemittanceVoucherProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto font-body">
      <div className="bg-background border border-border rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col my-8">
        <div className="h-14 bg-secondary/70 px-6 flex items-center justify-between border-b border-border print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-accent" />
            <span className="text-sm font-semibold text-foreground">Printable Remittance Voucher</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-8 bg-white text-slate-900 print:p-0 print:m-0 print:text-black">
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-display font-bold tracking-tight text-slate-900">ACCOUNTS PAYABLE REMITTANCE SLIP</h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">Official Authorized Disbursement Voucher</p>
              <p className="text-xs font-mono text-slate-600 mt-0.5">Voucher ID: VCH-{invoice.id.toUpperCase()}</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" /> APPROVED FOR PAYMENT
              </span>
              <p suppressHydrationWarning className="text-xs text-slate-500 mt-2">Date: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 my-6 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Payee / Vendor</span>
              <h3 className="text-sm font-bold text-slate-900">{invoice.vendor_name}</h3>
              <p className="text-slate-600 mt-0.5">Tax ID / EIN: {invoice.tax_id || 'On File'}</p>
              <p className="text-slate-600">Standard Payment Terms: Net 30</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Billing Details</span>
              <p className="text-slate-700 font-medium">Invoice Number: <span className="font-mono font-bold text-slate-900">{invoice.invoice_number}</span></p>
              <p className="text-slate-600 mt-0.5">Invoice Date: {invoice.invoice_date}</p>
              <p className="text-slate-600">Due Date: {invoice.due_date || 'Due Upon Receipt'}</p>
            </div>
          </div>

          <div className="border border-slate-300 rounded-xl overflow-hidden my-6">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-2.5">Line Description</th>
                  <th className="p-2.5 text-center w-20">Quantity</th>
                  <th className="p-2.5 text-right w-28">Unit Price</th>
                  <th className="p-2.5 text-right w-32">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {invoice.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-2.5 font-medium">{item.description}</td>
                    <td className="p-2.5 text-center font-mono">{item.quantity}</td>
                    <td className="p-2.5 text-right font-mono">${item.unit_price.toFixed(2)}</td>
                    <td className="p-2.5 text-right font-mono font-bold">${item.total_price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end my-4">
            <div className="w-64 space-y-1.5 text-xs text-slate-700">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-mono font-medium">${invoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Sales Tax / VAT:</span>
                <span className="font-mono font-medium">${invoice.tax_amount.toFixed(2)}</span>
              </div>
              <div className="border-t-2 border-slate-900 pt-1.5 flex justify-between text-sm font-bold text-slate-900">
                <span>Total Payment Authorized:</span>
                <span className="font-mono">${invoice.total_amount.toFixed(2)} USD</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-300 pt-6 mt-8 grid grid-cols-2 gap-8 text-xs text-slate-600">
            <div>
              <p className="font-bold text-slate-900 mb-6">Financial Controller Approval:</p>
              <div className="border-b border-slate-400 pb-1 flex justify-between items-end">
                <span className="font-mono font-semibold text-slate-800">{invoice.approved_by || 'Verified & Authorized'}</span>
                <span className="text-[10px] text-slate-400">Electronic Signoff</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Audit verification hash: {invoice.id}</p>
            </div>

            <div>
              <p className="font-bold text-slate-900 mb-6">Disbursement Officer Signature:</p>
              <div className="border-b border-slate-400 pb-1">
                <span className="text-slate-400 italic">Authorized Signature</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Date: ________________________</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
