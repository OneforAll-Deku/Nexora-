import os
from pathlib import Path
import base64
import hashlib

BASE_DIR = Path(__file__).resolve().parent.parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

MASTER_KEY = os.getenv("MASTER_ENCRYPTION_KEY", "b3NfYXBhY2hlX3VuaXZlcnNhbF9ieW9rX2tleV8xMjM0NQ==")

def get_fernet_key(seed: str) -> bytes:
    key_bytes = hashlib.sha256(seed.encode()).digest()
    return base64.urlsafe_b64encode(key_bytes)

FERNET_KEY = get_fernet_key(MASTER_KEY)

class Settings:
    PROJECT_NAME: str = "Intelligent Document & Invoice Processing ERP"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "*"
    ]
    UPLOAD_FOLDER: Path = UPLOAD_DIR
    GEMINI_MODEL: str = "gemini-2.5-flash"
    DEFAULT_CURRENCY: str = "USD"
    ARITHMETIC_TOLERANCE: float = 0.05
    Z_SCORE_THRESHOLD: float = 2.5
    PRICE_SURGE_PERCENT_THRESHOLD: float = 25.0

settings = Settings()
