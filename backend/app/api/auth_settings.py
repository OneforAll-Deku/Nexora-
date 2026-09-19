from fastapi import APIRouter, HTTPException, Depends
from app.models.schemas import (
    GeminiKeySaveRequest, GeminiKeyStatusResponse, SelectModelRequest,
    FetchModelsRequest, AddCustomModelRequest
)
from app.models.database import db
from app.core.security import encrypt_key, decrypt_key, mask_api_key
from app.core.gemini_client import gemini_client, GEMINI_MODELS
from app.core.openrouter_client import openrouter_client, OPENROUTER_MODELS
from app.core.config import settings
from typing import List, Dict, Any

router = APIRouter(prefix="/settings", tags=["BYOK Key Management"])

def _get_merged_gemini_models() -> List[Dict[str, Any]]:
    """Combines curated Gemini models with user-added custom models."""
    existing_ids = {m["id"] for m in GEMINI_MODELS}
    merged = list(GEMINI_MODELS)
    for cm in db.custom_gemini_models:
        if cm["id"] not in existing_ids:
            merged.append(cm)
            existing_ids.add(cm["id"])
    return merged

@router.get("/key-status", response_model=GeminiKeyStatusResponse)
def get_key_status():
    """Returns status for both Google Gemini and OpenRouter providers, active models, and full model catalogs."""
    google_conf = db.encrypted_byok_key is not None
    openrouter_conf = db.encrypted_openrouter_key is not None
    
    current_provider = db.provider
    active_mask = db.openrouter_key_mask if current_provider == "openrouter" else db.byok_key_mask
    is_active_valid = db.is_openrouter_valid if current_provider == "openrouter" else db.is_byok_valid
    
    if current_provider == "openrouter":
        active_model = db.openrouter_model or db.selected_model or "meta-llama/llama-3.3-70b-instruct"
    else:
        active_model = db.gemini_model or db.selected_model or "gemini-2.5-flash"

    return GeminiKeyStatusResponse(
        provider=current_provider,
        is_configured=openrouter_conf if current_provider == "openrouter" else google_conf,
        is_valid=is_active_valid,
        mask=active_mask,
        model=active_model,
        gemini_model=db.gemini_model,
        openrouter_model=db.openrouter_model,
        google_configured=google_conf,
        google_mask=db.byok_key_mask,
        openrouter_configured=openrouter_conf,
        openrouter_mask=db.openrouter_key_mask,
        available_gemini_models=_get_merged_gemini_models(),
        available_open_source_models=OPENROUTER_MODELS,
        message=f"Active Provider: {current_provider.upper()} ({'Verified' if is_active_valid else 'Simulation Fallback Mode'})"
    )

@router.post("/save-key", response_model=GeminiKeyStatusResponse)
def save_key(req: GeminiKeySaveRequest):
    """
    Validates and encrypts API Key for Google Gemini or OpenRouter AI provider.
    """
    raw_key = req.api_key.strip()
    if not raw_key:
        raise HTTPException(status_code=400, detail="API Key cannot be empty.")
    
    provider = req.provider.lower() if req.provider else "google"

    if provider == "openrouter":
        selected_model = req.model or db.openrouter_model or "meta-llama/llama-3.3-70b-instruct"
        is_valid, msg = openrouter_client.test_api_key(raw_key, model=selected_model)
        if not is_valid:
            raise HTTPException(status_code=400, detail=f"OpenRouter API Key verification failed: {msg}")
        
        encrypted = encrypt_key(raw_key)
        masked = mask_api_key(raw_key)
        
        db.encrypted_openrouter_key = encrypted
        db.openrouter_key_mask = masked
        db.is_openrouter_valid = True
        db.provider = "openrouter"
        db.openrouter_model = selected_model
        db.selected_model = selected_model
    else:
        # Google provider
        selected_model = req.model or db.gemini_model or "gemini-2.5-flash"
        is_valid, msg = gemini_client.test_api_key(raw_key, model=selected_model)
        if not is_valid:
            raise HTTPException(status_code=400, detail=f"Gemini API Key verification failed: {msg}")
        
        encrypted = encrypt_key(raw_key)
        masked = mask_api_key(raw_key)
        
        db.encrypted_byok_key = encrypted
        db.byok_key_mask = masked
        db.is_byok_valid = True
        db.provider = "google"
        db.gemini_model = selected_model
        db.selected_model = selected_model

        # Attempt to auto-fetch live available models from Google API to augment catalog
        try:
            live_models = gemini_client.fetch_models_from_google(raw_key)
            existing_ids = {m["id"] for m in GEMINI_MODELS}
            for lm in live_models:
                if lm["id"] not in existing_ids:
                    db.custom_gemini_models.append(lm)
                    existing_ids.add(lm["id"])
        except Exception:
            pass

    return get_key_status()

@router.post("/fetch-gemini-models", response_model=List[Dict[str, Any]])
def fetch_gemini_models(req: FetchModelsRequest = None):
    """
    Calls Google Generative Language API v1beta/models using either provided API key or active stored BYOK key.
    Returns all models supporting generateContent and marks free-tier eligibility.
    """
    key = (req.api_key.strip() if req and req.api_key else None)
    if not key and db.encrypted_byok_key:
        try:
            key = decrypt_key(db.encrypted_byok_key)
        except Exception:
            key = None

    if not key:
        return _get_merged_gemini_models()

    live_models = gemini_client.fetch_models_from_google(key)
    
    # Merge newly found models into custom list so they persist in UI
    existing_ids = {m["id"] for m in GEMINI_MODELS}
    for lm in live_models:
        if lm["id"] not in existing_ids:
            if not any(cm["id"] == lm["id"] for cm in db.custom_gemini_models):
                db.custom_gemini_models.append(lm)
            existing_ids.add(lm["id"])

    return live_models

@router.post("/add-custom-model", response_model=GeminiKeyStatusResponse)
def add_custom_model(req: AddCustomModelRequest):
    """Adds a new Gemini or OpenRouter model ID manually."""
    model_id = req.model_id.strip()
    if not model_id:
        raise HTTPException(status_code=400, detail="Model ID cannot be empty.")
    
    if req.provider.lower() == "google":
        model_obj = {
            "id": model_id,
            "name": req.name or model_id,
            "provider": "Google (AI Studio Custom)",
            "context_length": req.context_length,
            "is_vision": req.is_vision,
            "is_free_tier": req.is_free_tier,
            "badge": req.badge or "Custom Model",
            "description": req.description or f"Custom configured Google Gemini model '{model_id}'."
        }
        # Avoid duplicate
        db.custom_gemini_models = [m for m in db.custom_gemini_models if m["id"] != model_id]
        db.custom_gemini_models.append(model_obj)
        db.gemini_model = model_id
        if db.provider == "google":
            db.selected_model = model_id
    
    return get_key_status()

@router.post("/select-model", response_model=GeminiKeyStatusResponse)
def select_model(req: SelectModelRequest):
    """Switch active AI provider and model."""
    provider = req.provider.lower()
    if provider not in ["google", "openrouter"]:
        raise HTTPException(status_code=400, detail="Invalid provider. Must be 'google' or 'openrouter'.")
    
    db.provider = provider
    if provider == "google":
        db.gemini_model = req.model
        db.selected_model = req.model
    else:
        db.openrouter_model = req.model
        db.selected_model = req.model

    return get_key_status()

@router.delete("/remove-key")
def remove_key(provider: str = "all"):
    """Removes stored BYOK keys."""
    prov = provider.lower()
    if prov in ["google", "all"]:
        db.encrypted_byok_key = None
        db.byok_key_mask = "Not Configured"
        db.is_byok_valid = False
    if prov in ["openrouter", "all"]:
        db.encrypted_openrouter_key = None
        db.openrouter_key_mask = "Not Configured"
        db.is_openrouter_valid = False

    return {"message": f"BYOK Key ({provider}) removed successfully."}

@router.post("/test-ping")
def test_ping():
    """Manually test connectivity of active stored key and provider."""
    provider = db.provider
    if provider == "openrouter":
        if not db.encrypted_openrouter_key:
            return {"is_valid": False, "message": "No OpenRouter key configured."}
        try:
            raw_key = decrypt_key(db.encrypted_openrouter_key)
            is_valid, msg = openrouter_client.test_api_key(raw_key, model=db.openrouter_model or db.selected_model)
            db.is_openrouter_valid = is_valid
            return {"is_valid": is_valid, "message": msg}
        except Exception as e:
            return {"is_valid": False, "message": str(e)}
    else:
        if not db.encrypted_byok_key:
            return {"is_valid": False, "message": "No Gemini key configured."}
        try:
            raw_key = decrypt_key(db.encrypted_byok_key)
            target_model = db.gemini_model or db.selected_model or "gemini-2.5-flash"
            is_valid, msg = gemini_client.test_api_key(raw_key, model=target_model)
            db.is_byok_valid = is_valid
            return {"is_valid": is_valid, "message": msg}
        except Exception as e:
            return {"is_valid": False, "message": str(e)}
