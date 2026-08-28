from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from src.api.feed import router as feed_router
from src.api.products import router as products_router
from src.api.templates import router as templates_router
from src.api.assistant import router as assistant_router
from src.api.auth import router as auth_router

app = FastAPI(title="Economiza.AI Alagoas API", version="1.0.0")
app.include_router(auth_router, prefix="/api/v1", tags=["Auth"])
app.include_router(feed_router, prefix="/api/v1")
app.include_router(products_router, prefix="/api/v1")
app.include_router(templates_router, prefix="/api/v1/templates", tags=["Templates"])
app.include_router(assistant_router, prefix="/api/v1/assistant", tags=["Assistant"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"message": "Internal server error", "details": str(exc)},
    )

@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "connected", "assistant": "ready"}

