import pytest
from app.core.security import encrypt_key, decrypt_key, mask_api_key
from app.models.schemas import InvoiceExtract, LineItem, AnomalyType
from app.services.audit_service import audit_service
from app.models.database import db

def test_fernet_encryption_and_masking():
    raw_key = "AIzaSyDummySecretKeyForTestOnly12345"
    encrypted = encrypt_key(raw_key)
    assert encrypted != raw_key
    
    decrypted = decrypt_key(encrypted)
    assert decrypted == raw_key
    
    masked = mask_api_key(raw_key)
    assert masked.startswith("AIzaSy")
    assert masked.endswith("2345")
    assert "•" in masked

def test_arithmetic_sanity_check():
    # Case 1: Matching amounts -> No Arithmetic flag
    valid_extract = InvoiceExtract(
        vendor_name="Test Vendor",
        invoice_number="INV-001",
        invoice_date="2026-09-01",
        subtotal=200.00,
        tax_amount=20.00,
        total_amount=220.00,
        items=[
            LineItem(description="Widget A", quantity=2.0, unit_price=100.00, total_price=200.00)
        ]
    )
    flags, _ = audit_service.audit_invoice(valid_extract)
    arithmetic_flags = [f for f in flags if f.flag_type == AnomalyType.ARITHMETIC_MISMATCH]
    assert len(arithmetic_flags) == 0

    # Case 2: Math error ($100 mismatch) -> Should trigger ARITHMETIC_MISMATCH
    invalid_extract = InvoiceExtract(
        vendor_name="Test Vendor",
        invoice_number="INV-002",
        invoice_date="2026-09-01",
        subtotal=200.00,
        tax_amount=20.00,
        total_amount=320.00, # Expected 220, got 320
        items=[
            LineItem(description="Widget A", quantity=2.0, unit_price=100.00, total_price=200.00)
        ]
    )
    flags, _ = audit_service.audit_invoice(invalid_extract)
    arithmetic_flags = [f for f in flags if f.flag_type == AnomalyType.ARITHMETIC_MISMATCH]
    assert len(arithmetic_flags) == 1
    assert arithmetic_flags[0].severity == "critical"

def test_duplicate_submission_detection():
    # Attempting to submit existing invoice number APX-2026-101 for Apex Logistics Corp
    dup_extract = InvoiceExtract(
        vendor_name="Apex Logistics Corp",
        invoice_number="APX-2026-101",
        invoice_date="2026-09-01",
        subtotal=3600.00,
        tax_amount=288.00,
        total_amount=3888.00,
        items=[]
    )
    flags, _ = audit_service.audit_invoice(dup_extract)
    dup_flags = [f for f in flags if f.flag_type == AnomalyType.DUPLICATE_INVOICE]
    assert len(dup_flags) == 1
    assert "Duplicate Submission Detected" in dup_flags[0].message

def test_price_surge_z_score_detection():
    # Apex Logistics historical baseline for 'Standard Pallet Shipping (Zone 4)' is ~$120.00
    # Submitting unit price of $210.00 (Z-Score > 10σ)
    surge_extract = InvoiceExtract(
        vendor_name="Apex Logistics Corp",
        invoice_number="APX-2026-SURGE-TEST",
        invoice_date="2026-09-01",
        subtotal=2100.00,
        tax_amount=0.00,
        total_amount=2100.00,
        items=[
            LineItem(
                description="Standard Pallet Shipping (Zone 4)",
                quantity=10.0,
                unit_price=210.00,
                total_price=2100.00
            )
        ]
    )
    flags, audited_items = audit_service.audit_invoice(surge_extract)
    surge_flags = [f for f in flags if f.flag_type == AnomalyType.PRICE_SURGE]
    assert len(surge_flags) == 1
    assert audited_items[0].is_anomaly is True
    assert audited_items[0].z_score > 2.5

def test_openrouter_models_catalog_and_key_handling():
    from app.core.openrouter_client import OPENROUTER_MODELS, openrouter_client
    assert len(OPENROUTER_MODELS) >= 5
    model_ids = [m["id"] for m in OPENROUTER_MODELS]
    assert "meta-llama/llama-3.3-70b-instruct" in model_ids
    assert "qwen/qwen-2.5-vl-72b-instruct" in model_ids
    assert "deepseek/deepseek-chat" in model_ids

    # Empty key check
    is_valid, msg = openrouter_client.test_api_key("")
    assert is_valid is False
    assert "required" in msg.lower()

def test_gemini_models_catalog_and_selection():
    from app.core.gemini_client import GEMINI_MODELS, gemini_client
    assert len(GEMINI_MODELS) >= 5
    model_ids = [m["id"] for m in GEMINI_MODELS]
    assert "gemini-2.5-flash" in model_ids
    assert "gemini-2.0-flash" in model_ids
    assert "gemini-1.5-flash" in model_ids

    flash_model = next(m for m in GEMINI_MODELS if m["id"] == "gemini-2.5-flash")
    assert flash_model["is_free_tier"] is True
    assert flash_model["is_vision"] is True

    # Empty key test
    is_valid, msg = gemini_client.test_api_key("")
    assert is_valid is False
    assert "required" in msg.lower()
