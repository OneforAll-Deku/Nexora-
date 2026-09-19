import { InvoiceRecord, DocumentRecord, VendorRecord, GeminiKeyStatus, GeminiModel, AnomalySummary, InvoiceExtract } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL
  ? (process.env.NEXT_PUBLIC_API_URL.endsWith('/api/v1') ? process.env.NEXT_PUBLIC_API_URL : `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')}/api/v1`)
  : (typeof window !== 'undefined' ? '/api/v1' : 'http://127.0.0.1:8000/api/v1');

export const apiClient = {
  async getKeyStatus(): Promise<GeminiKeyStatus> {
    try {
      const res = await fetch(`${API_BASE}/settings/key-status`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch status');
      return await res.json();
    } catch {
      return {
        is_configured: false,
        is_valid: false,
        mask: 'Not Configured',
        model: 'gemini-2.5-flash',
        message: 'Demo / Simulation Mode Active'
      };
    }
  },

  async saveKey(apiKey: string, provider: string = 'google', model?: string): Promise<GeminiKeyStatus> {
    const res = await fetch(`${API_BASE}/settings/save-key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: apiKey, provider, model })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to verify key' }));
      throw new Error(err.detail || 'Failed to save API key');
    }
    return await res.json();
  },

  async selectModel(provider: string, model: string): Promise<GeminiKeyStatus> {
    const res = await fetch(`${API_BASE}/settings/select-model`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, model })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to update active model' }));
      throw new Error(err.detail || 'Failed to select model');
    }
    return await res.json();
  },

  async fetchGeminiModels(apiKey?: string): Promise<GeminiModel[]> {
    const res = await fetch(`${API_BASE}/settings/fetch-gemini-models`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: apiKey })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to fetch Gemini models' }));
      throw new Error(err.detail || 'Failed to fetch Gemini models from Google API');
    }
    return await res.json();
  },

  async addCustomModel(data: {
    provider: string;
    model_id: string;
    name?: string;
    context_length?: number;
    is_vision?: boolean;
    is_free_tier?: boolean;
    badge?: string;
    description?: string;
  }): Promise<GeminiKeyStatus> {
    const res = await fetch(`${API_BASE}/settings/add-custom-model`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to add custom model' }));
      throw new Error(err.detail || 'Failed to add custom model');
    }
    return await res.json();
  },

  async removeKey(provider: string = 'all'): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/settings/remove-key?provider=${provider}`, { method: 'DELETE' });
    return await res.json();
  },

  async testPing(): Promise<{ is_valid: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/settings/test-ping`, { method: 'POST' });
    return await res.json();
  },

  async getInvoices(status?: string, vendorId?: string): Promise<InvoiceRecord[]> {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (vendorId) params.append('vendor_id', vendorId);
      const res = await fetch(`${API_BASE}/invoices?${params.toString()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load invoices');
      return await res.json();
    } catch (e) {
      console.warn('API error, using local fallback:', e);
      return [];
    }
  },

  async getInvoiceById(id: string): Promise<InvoiceRecord> {
    const res = await fetch(`${API_BASE}/invoices/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Invoice not found');
    return await res.json();
  },

  async updateInvoice(id: string, payload: InvoiceExtract): Promise<InvoiceRecord> {
    const res = await fetch(`${API_BASE}/invoices/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to update invoice');
    return await res.json();
  },

  async approveInvoice(invoiceId: string, approvedBy: string = 'Financial Controller', updatedInvoice?: InvoiceExtract): Promise<InvoiceRecord> {
    const res = await fetch(`${API_BASE}/invoices/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoice_id: invoiceId, approved_by: approvedBy, updated_invoice: updatedInvoice })
    });
    if (!res.ok) throw new Error('Failed to approve invoice');
    return await res.json();
  },

  async getVendors(): Promise<VendorRecord[]> {
    const res = await fetch(`${API_BASE}/invoices/vendors/list`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  },

  async uploadAndProcess(file: File, customKey?: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    if (customKey) formData.append('custom_key', customKey);

    const res = await fetch(`${API_BASE}/documents/upload-and-process`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload and extraction failed' }));
      throw new Error(err.detail || 'Extraction failed');
    }
    return await res.json();
  },

  async getDocumentQueue(): Promise<DocumentRecord[]> {
    const res = await fetch(`${API_BASE}/documents/queue`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  },

  async getAnomalySummary(): Promise<AnomalySummary> {
    const res = await fetch(`${API_BASE}/anomalies/summary`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load anomaly metrics');
    return await res.json();
  },

  async getRemittanceData(invoiceId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/exports/remittance/${invoiceId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch remittance slip');
    return await res.json();
  }
};
