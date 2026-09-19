from cryptography.fernet import Fernet
from app.core.config import FERNET_KEY

fernet_cipher = Fernet(FERNET_KEY)

def encrypt_key(plain_key: str) -> str:
    """Encrypts plaintext BYOK Gemini API key using AES-Fernet symmetric encryption."""
    if not plain_key:
        return ""
    encrypted_bytes = fernet_cipher.encrypt(plain_key.strip().encode("utf-8"))
    return encrypted_bytes.decode("utf-8")

def decrypt_key(encrypted_key: str) -> str:
    """Decrypts ciphertext into plaintext Gemini API key."""
    if not encrypted_key:
        return ""
    decrypted_bytes = fernet_cipher.decrypt(encrypted_key.encode("utf-8"))
    return decrypted_bytes.decode("utf-8")

def mask_api_key(key: str) -> str:
    """Creates a standard masked representation, e.g. AIzaSy••••••4x9B"""
    if not key:
        return "Not Configured"
    key = key.strip()
    if len(key) <= 8:
        return "••••••••"
    prefix = key[:6]
    suffix = key[-4:]
    masked_middle = "•" * max(6, len(key) - 10)
    return f"{prefix}{masked_middle}{suffix}"
