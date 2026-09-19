import os
import json
import base64
import requests
from typing import Dict, Any, Optional, List, Tuple
from app.models.schemas import InvoiceExtract, LineItem
from app.core.config import settings

INVOICE_PROMPT = """
You are an expert enterprise invoice & document extraction AI.
Extract all relevant accounts payable financial fields from this document image/PDF into STRICT JSON conforming to this schema:
{
  "vendor_name": "string (full company/vendor name)",
  "tax_id": "string or null (EIN, VAT, GST, Tax ID)",
  "invoice_number": "string (invoice #, bill #, receipt #)",
  "invoice_date": "YYYY-MM-DD",
  "due_date": "YYYY-MM-DD or null",
  "currency": "USD (or detected ISO 3-letter currency code)",
  "subtotal": float (number with 2 decimal places),
  "tax_amount": float (tax or VAT or 0.0),
  "total_amount": float (grand total),
  "payment_terms": "string or null (e.g. Net 30, Due Upon Receipt)",
  "items": [
    {
      "description": "string (item/service name and details)",
      "quantity": float (default 1.0),
      "unit_price": float,
      "total_price": float,
      "item_code": "string or null"
    }
  ]
}

CRITICAL RULES:
1. Return ONLY pure valid JSON with NO markdown code block wrappers.
2. Read all line items carefully.
3. If tax is not specified, set tax_amount to 0.0.
4. Ensure invoice_date is formatted as YYYY-MM-DD.
"""

GEMINI_MODELS: List[Dict[str, Any]] = [
    {
        "id": "gemini-2.5-flash",
        "name": "Gemini 2.5 Flash",
        "provider": "Google (AI Studio)",
        "context_length": 1048576,
        "is_vision": True,
        "is_free_tier": True,
        "badge": "Recommended / Latest Free",
        "description": "Next-gen flagship multimodal model optimized for highest speed, reasoning, and accuracy. Free tier includes up to 1,500 requests/day."
    },
    {
        "id": "gemini-2.5-flash-lite",
        "name": "Gemini 2.5 Flash-Lite",
        "provider": "Google (AI Studio)",
        "context_length": 1048576,
        "is_vision": True,
        "is_free_tier": True,
        "badge": "Ultra Fast / Free Tier",
        "description": "High-throughput, lowest-latency multimodal model with maximum free rate limits for high-volume accounts payable pipelines."
    },
    {
        "id": "gemini-2.0-flash",
        "name": "Gemini 2.0 Flash",
        "provider": "Google (AI Studio)",
        "context_length": 1048576,
        "is_vision": True,
        "is_free_tier": True,
        "badge": "Multimodal Workhorse",
        "description": "Production-hardened multimodal OCR model with native PDF parsing and high token throughput on the Google AI Studio free tier."
    },
    {
        "id": "gemini-2.0-flash-lite",
        "name": "Gemini 2.0 Flash-Lite",
        "provider": "Google (AI Studio)",
        "context_length": 1048576,
        "is_vision": True,
        "is_free_tier": True,
        "badge": "High Concurrency",
        "description": "Lightweight sub-second response engine for instant receipt and invoice pre-audits."
    },
    {
        "id": "gemini-1.5-flash",
        "name": "Gemini 1.5 Flash",
        "provider": "Google (AI Studio)",
        "context_length": 1048576,
        "is_vision": True,
        "is_free_tier": True,
        "badge": "Stable Long-Context",
        "description": "Proven 1M token context window ideal for dense multi-page invoice portfolios and historical cross-referencing."
    },
    {
        "id": "gemini-2.5-pro",
        "name": "Gemini 2.5 Pro",
        "provider": "Google (AI Studio)",
        "context_length": 2097152,
        "is_vision": True,
        "is_free_tier": False,
        "badge": "Deep Reasoning",
        "description": "Maximum reasoning power for intricate financial schedules, multi-tax splits, and complex border trade invoices."
    }
]

class GeminiClient:
    @staticmethod
    def test_api_key(api_key: str, model: str = "gemini-2.5-flash") -> Tuple[bool, str]:
        """Runs a lightweight test pre-flight request to verify if key is valid and active with selected model."""
        if not api_key:
            return False, "API key is required"
        
        target_model = model.strip() if model else "gemini-2.5-flash"
        if target_model.startswith("models/"):
            target_model = target_model.replace("models/", "")

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{target_model}:generateContent?key={api_key.strip()}"
        payload = {
            "contents": [{
                "parts": [{"text": "Reply with 'PING_OK' if active."}]
            }],
            "generationConfig": {
                "maxOutputTokens": 10,
                "temperature": 0.0
            }
        }
        headers = {"Content-Type": "application/json"}
        
        try:
            res = requests.post(url, json=payload, headers=headers, timeout=12)
            if res.status_code == 200:
                return True, f"Google Gemini API Key verified active with model '{target_model}'."
            elif res.status_code == 400:
                err_msg = res.json().get("error", {}).get("message", "Invalid API Key or Model")
                return False, f"Key Validation Error: {err_msg}"
            elif res.status_code == 403:
                return False, "Access Denied: Check API Key permissions or project setup in Google AI Studio."
            elif res.status_code == 404:
                return False, f"Model '{target_model}' not found in Google AI Studio or not available for this key."
            elif res.status_code == 429:
                return False, "Rate Limit Exceeded: Daily or per-minute quota reached on Google AI Studio."
            else:
                return False, f"HTTP {res.status_code}: {res.text[:100]}"
        except Exception as e:
            return False, f"Connection to Google AI API failed: {str(e)}"

    @staticmethod
    def fetch_models_from_google(api_key: str) -> List[Dict[str, Any]]:
        """
        Calls Google Generative Language API v1beta/models to discover active models for this API key.
        Filters for models supporting 'generateContent' and marks free tier eligible models.
        """
        if not api_key:
            return GEMINI_MODELS

        url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key.strip()}"
        try:
            res = requests.get(url, timeout=12)
            if res.status_code != 200:
                return GEMINI_MODELS

            data = res.json()
            raw_models = data.get("models", [])
            fetched: List[Dict[str, Any]] = []

            for m in raw_models:
                methods = m.get("supportedGenerationMethods", [])
                if "generateContent" not in methods:
                    continue

                raw_name = m.get("name", "")
                model_id = raw_name.replace("models/", "")

                # Keep only gemini models
                if not model_id.startswith("gemini"):
                    continue

                is_flash = "flash" in model_id.lower()
                is_pro = "pro" in model_id.lower()
                is_free = is_flash or not is_pro

                badge = "Free Tier Eligible" if is_free else "Standard / Paid"
                if model_id == "gemini-2.5-flash":
                    badge = "Recommended / Latest Free"
                elif "lite" in model_id.lower():
                    badge = "Ultra Fast / Free Tier"
                elif "pro" in model_id.lower():
                    badge = "Deep Reasoning"
                elif "exp" in model_id.lower():
                    badge = "Experimental Preview"

                fetched.append({
                    "id": model_id,
                    "name": m.get("displayName") or model_id,
                    "provider": "Google (AI Studio)",
                    "context_length": m.get("inputTokenLimit", 1048576),
                    "is_vision": True,
                    "is_free_tier": is_free,
                    "badge": badge,
                    "description": m.get("description") or "Google multimodal document intelligence model."
                })

            if fetched:
                # Sort so that Recommended / Latest Free comes first
                fetched.sort(
                    key=lambda x: (
                        0 if x["id"] == "gemini-2.5-flash" else (
                            1 if "2.5-flash" in x["id"] else (
                                2 if "flash" in x["id"] else 3
                            )
                        )
                    )
                )
                return fetched
            return GEMINI_MODELS
        except Exception:
            return GEMINI_MODELS

    @staticmethod
    def extract_document(
        file_bytes: bytes,
        mime_type: str,
        api_key: str,
        model: str = "gemini-2.5-flash"
    ) -> InvoiceExtract:
        """
        Sends document image/PDF to selected Gemini model with structured multimodal prompt
        and returns validated Pydantic InvoiceExtract model.
        """
        if not api_key:
            raise ValueError("No Gemini API key provided. Please configure your BYOK key in Settings.")

        base64_data = base64.b64encode(file_bytes).decode("utf-8")

        # Map common mime types
        clean_mime = mime_type.lower()
        if "pdf" in clean_mime:
            mime = "application/pdf"
        elif "png" in clean_mime:
            mime = "image/png"
        elif "webp" in clean_mime:
            mime = "image/webp"
        else:
            mime = "image/jpeg"

        target_model = model.strip() if model else settings.GEMINI_MODEL
        if target_model.startswith("models/"):
            target_model = target_model.replace("models/", "")

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{target_model}:generateContent?key={api_key.strip()}"
        
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": INVOICE_PROMPT},
                        {
                            "inlineData": {
                                "mimeType": mime,
                                "data": base64_data
                            }
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.1,
                "responseMimeType": "application/json"
            }
        }
        
        headers = {"Content-Type": "application/json"}
        response = requests.post(url, json=payload, headers=headers, timeout=35)
        
        if response.status_code != 200:
            error_data = response.json().get("error", {})
            error_msg = error_data.get("message", response.text)
            raise RuntimeError(f"Gemini API error ({response.status_code}) using model '{target_model}': {error_msg}")

        res_json = response.json()
        try:
            candidate_text = res_json["candidates"][0]["content"]["parts"][0]["text"]
            # Clean markdown if present
            candidate_text = candidate_text.strip()
            if candidate_text.startswith("```json"):
                candidate_text = candidate_text[7:]
            if candidate_text.startswith("```"):
                candidate_text = candidate_text[3:]
            if candidate_text.endswith("```"):
                candidate_text = candidate_text[:-3]
            
            raw_data = json.loads(candidate_text.strip())
            
            # Format and validate with Pydantic
            items = []
            for item in raw_data.get("items", []):
                qty = float(item.get("quantity") or 1.0)
                u_price = float(item.get("unit_price") or 0.0)
                t_price = float(item.get("total_price") or (qty * u_price))
                items.append(
                    LineItem(
                        description=str(item.get("description", "Unnamed Item")),
                        quantity=qty,
                        unit_price=u_price,
                        total_price=t_price,
                        item_code=item.get("item_code")
                    )
                )

            extract = InvoiceExtract(
                vendor_name=str(raw_data.get("vendor_name") or "Unknown Vendor"),
                tax_id=raw_data.get("tax_id"),
                invoice_number=str(raw_data.get("invoice_number") or f"INV-{os.urandom(3).hex().upper()}"),
                invoice_date=str(raw_data.get("invoice_date") or "2026-09-01"),
                due_date=raw_data.get("due_date"),
                currency=str(raw_data.get("currency") or "USD"),
                subtotal=float(raw_data.get("subtotal") or sum(i.total_price for i in items)),
                tax_amount=float(raw_data.get("tax_amount") or 0.0),
                total_amount=float(raw_data.get("total_amount") or 0.0),
                payment_terms=raw_data.get("payment_terms") or "Net 30",
                items=items
            )
            return extract
            
        except Exception as e:
            raise ValueError(f"Failed to parse Gemini model extraction response: {str(e)}")

gemini_client = GeminiClient()
