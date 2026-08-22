from typing import Dict
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router as api_router
from app.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="CAMPVENTO - AI-Powered Campus Sponsorship Intelligence Platform API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [settings.CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Direct root /health endpoint as specified
@app.get("/health", response_model=Dict[str, str], tags=["Health"])
async def health_check() -> Dict[str, str]:
    """Health check endpoint to verify backend operational status."""
    return {
        "status": "ok",
        "service": "campvento-api"
    }

# Include API Router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.BACKEND_HOST,
        port=settings.BACKEND_PORT,
        reload=settings.DEBUG,
    )
