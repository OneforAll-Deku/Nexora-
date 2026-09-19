import os
import json
import base64
import requests
from typing import Dict, Any, Optional, List, Tuple
from app.models.schemas import InvoiceExtract, LineItem
from app.core.gemini_client import INVOICE_PROMPT

OPENROUTER_MODELS = [
    {
        "id": "meta-llama/llama-3.3-70b-instruct",
        "name": "Meta Llama 3.3 70B Instruct",
        "provider": "Meta (Open Source)",
        "context_length": 128000,
        "is_vision": False,
        "badge": "Recommended"
    },
    {
        "id": "qwen/qwen-2.5-vl-72b-instruct",
        "name": "Qwen 2.5 VL 72B Multimodal",
        "provider": "Alibaba (Open Source Vision)",
        "context_length": 128000,
        "is_vision": True,
        "badge": "Multimodal Vision"
    },
    {
        "id": "deepseek/deepseek-chat",
        "name": "DeepSeek V3",
        "provider": "DeepSeek (Open Source)",
        "context_length": 64000,
        "is_vision": False,
        "badge": "High Speed"
    },
    {
        "id": "deepseek/deepseek-r1",
        "name": "DeepSeek R1 Reasoning",
        "provider": "DeepSeek (Open Source)",
        "context_length": 64000,
        "is_vision": False,
        "badge": "Reasoning Engine"
    },
    {
        "id": "mistralai/mistral-small-24b-instruct-2501",
        "name": "Mistral Small 24B",
        "provider": "Mistral AI (Open Source)",
        "context_length": 32000,
        "is_vision": False,
        "badge": "Compact OS"
    },
    {
        "id": "meta-llama/llama-3.2-11b-vision-instruct",
        "name": "Meta Llama 3.2 11B Vision",
        "provider": "Meta (Open Source Vision)",
        "context_length": 128000,
        "is_vision": True,
        "badge": "Fast Vision"
    }
]

class OpenRouterClient:
    @staticmethod
    def test_api_key(api_key: str, model: str = "meta-llama/llama-3.3-70b-instruct") -> Tuple[bool, str]:
        """Validates OpenRouter API key with a pre-flight ping."""
        if not api_key:
            return False, "OpenRouter API key is required"
        
        headers = {
            "Authorization": f"Bearer {api_key.strip()}",
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "Nexora Intelligent ERP",
            "Content-Type": "application/json"
        }
        
        # Test key validity via /api/v1/auth/key or a minimal completion
        url = "https://openrouter.ai/api/v1/chat/completions"
        payload = {
            "model": model,
            "messages": [
                {"role": "user", "content": "Reply with 'PING_OK' if key is active."}
            ],
            "max_tokens": 10,
            "temperature": 0.0
        }
        
        try:
            res = requests.post(url, json=payload, headers=headers, timeout=12)
            if res.status_code == 200:
                return True, "OpenRouter API Key is active and verified."
            elif res.status_code == 401:
                return False, "Invalid OpenRouter API Key (401 Unauthorized)."
            elif res.status_code == 402:
                return False, "Insufficient OpenRouter Credits/Quota (402 Payment Required)."
            else:
                err = res.json().get("error", {}).get("message", res.text[:100])
                return False, f"OpenRouter Error ({res.status_code}): {err}"
        except Exception as e:
            return False, f"Connection to OpenRouter failed: {str(e)}"

    @staticmethod
    def extract_document(
        file_bytes: bytes,
        mime_type: str,
        api_key: str,
        model: str = "meta-llama/llama-3.3-70b-instruct"
    ) -> InvoiceExtract:
        """
        Sends document image/PDF payload to selected OpenRouter Open-Source LLM model.
        """
        if not api_key:
            raise ValueError("No OpenRouter API key provided. Please configure your key in Settings.")

        base64_data = base64.b64encode(file_bytes).decode("utf-8")
        clean_mime = mime_type.lower()
        if "pdf" in clean_mime:
            mime = "application/pdf"
        elif "png" in clean_mime:
            mime = "image/png"
        elif "webp" in clean_mime:
            mime = "image/webp"
        else:
            mime = "image/jpeg"

        url = "https://openrouter.ai/api/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key.strip()}",
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "Nexora Intelligent ERP",
            "Content-Type": "application/json"
        }

        # Build message payload supporting multimodal vision or text
        user_content = [
            {"type": "text", "text": INVOICE_PROMPT},
            {"type": "image_url", "image_url": {"url": f"data:{mime};base64,{base64_data}"}}
        ]

        payload = {
            "model": model,
            "messages": [
                {
                    "role": "user",
                    "content": user_content
                }
            ],
            "temperature": 0.1,
            "response_format": {"type": "json_object"}
        }

        res = requests.post(url, json=payload, headers=headers, timeout=40)
        if res.status_code != 200:
            err = res.json().get("error", {}).get("message", res.text[:150])
            raise RuntimeError(f"OpenRouter API error ({res.status_code}): {err}")

        res_json = res.json()
        try:
            candidate_text = res_json["choices"][0]["message"]["content"].strip()
            if candidate_text.startswith("```json"):
                candidate_text = candidate_text[7:]
            if candidate_text.startswith("```"):
                candidate_text = candidate_text[3:]
            if candidate_text.endswith("```"):
                candidate_text = candidate_text[:-3]

            raw_data = json.loads(candidate_text.strip())

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
            raise ValueError(f"Failed to parse OpenRouter model response: {str(e)}")

openrouter_client = OpenRouterClient()
