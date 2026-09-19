export type DocStatus = 'pending' | 'processing' | 'completed' | 'flagged' | 'rejected';

export type AnomalyType = 
  | 'ARITHMETIC_MISMATCH'
  | 'DUPLICATE_INVOICE'
  | 'PRICE_SURGE'
  | 'UNKNOWN_VENDOR'
  | 'DATE_OUT_OF_BOUNDS';

export interface AnomalyFlag {
  flag_type: AnomalyType;
  severity: 'warning' | 'critical' | 'info';
  field?: string;
  message: string;
  details?: Record<string, any>;
}

export interface LineItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  item_code?: string;
  historical_avg_price?: number;
  z_score?: number;
  surge_percentage?: number;
  is_anomaly?: boolean;
  anomaly_reason?: string;
}

export interface InvoiceExtract {
  vendor_name: string;
  tax_id?: string;
  invoice_number: string;
  invoice_date: string;
  due_date?: string;
  currency: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  payment_terms?: string;
  items: LineItem[];
}

export interface InvoiceRecord {
  id: string;
  document_id?: string;
  vendor_id?: string;
  vendor_name: string;
  tax_id?: string;
  invoice_number: string;
  invoice_date: string;
  due_date?: string;
  currency: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  is_approved: boolean;
  reconciliation_flags: AnomalyFlag[];
  items: LineItem[];
  file_name?: string;
  file_url?: string;
  created_at: string;
  approved_at?: string;
  approved_by?: string;
}

export interface DocumentRecord {
  id: string;
  file_name: string;
  file_url: string;
  file_size_bytes: number;
  content_type: string;
  status: DocStatus;
  invoice_id?: string;
  raw_ocr_payload?: Record<string, any>;
  created_at: string;
}

export interface VendorRecord {
  id: string;
  name: string;
  tax_id?: string;
  payment_terms: string;
  total_invoices_count: number;
  total_spend: number;
  created_at: string;
}

export interface OpenSourceModel {
  id: string;
  name: string;
  provider: string;
  context_length: number;
  is_vision: boolean;
  badge: string;
}

export interface GeminiModel {
  id: string;
  name: string;
  provider: string;
  context_length: number;
  is_vision: boolean;
  is_free_tier: boolean;
  badge: string;
  description?: string;
}

export interface GeminiKeyStatus {
  provider?: string;
  is_configured: boolean;
  is_valid: boolean;
  mask: string;
  model: string;
  gemini_model?: string;
  openrouter_model?: string;
  google_configured?: boolean;
  google_mask?: string;
  openrouter_configured?: boolean;
  openrouter_mask?: string;
  available_gemini_models?: GeminiModel[];
  available_open_source_models?: OpenSourceModel[];
  message?: string;
}

export interface AnomalySummary {
  metrics: {
    total_invoices_audited: number;
    total_flagged_count: number;
    total_approved_count: number;
    arithmetic_mismatches: number;
    duplicate_submissions: number;
    price_surges: number;
    audit_catch_rate_pct: number;
  };
  flagged_invoices: Array<{
    invoice_id: string;
    invoice_number: string;
    vendor_name: string;
    total_amount: number;
    invoice_date: string;
    flags: AnomalyFlag[];
    items_count: number;
  }>;
  surge_items: Array<{
    invoice_id: string;
    invoice_number: string;
    vendor_name: string;
    description: string;
    billed_price: number;
    historical_avg?: number;
    z_score?: number;
    surge_percentage?: number;
    reason?: string;
  }>;
}
