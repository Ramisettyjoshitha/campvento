from typing import Dict
from fastapi import APIRouter

router = APIRouter()


@router.get("/health", response_model=Dict[str, str], tags=["Health"])
async def health_check() -> Dict[str, str]:
    """Health check endpoint to verify backend operational status."""
    return {
        "status": "ok",
        "service": "campvento-api"
    }
