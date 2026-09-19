from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.api import auth_settings, documents, invoices, anomaly, exports

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Enterprise-grade Intelligent Document & Invoice Processing ERP (BYOK Edition)"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Uploads directory for document rendering
app.mount("/uploads", StaticFiles(directory=str(settings.UPLOAD_FOLDER)), name="uploads")

# Include API Routers
app.include_router(auth_settings.router, prefix=settings.API_V1_STR)
app.include_router(documents.router, prefix=settings.API_V1_STR)
app.include_router(invoices.router, prefix=settings.API_V1_STR)
app.include_router(anomaly.router, prefix=settings.API_V1_STR)
app.include_router(exports.router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["System Health"])
def health_check():
    """NFR-7.1: Lightweight cold-start mitigation endpoint polled by uptime monitors."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "model": settings.GEMINI_MODEL
    }

@app.get("/", tags=["Root"])
def root():
    return {
        "message": f"{settings.PROJECT_NAME} API is running.",
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
