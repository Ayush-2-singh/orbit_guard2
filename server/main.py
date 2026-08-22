"""
OrbitGuard Backend API Server.

FastAPI application providing:
- Satellite data management
- ML-powered risk assessment
- Conjunction prediction
- Orbital density analysis
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .routes import satellites, analysis
import os

# ─── Create FastAPI App ──────────────────────────────────────────────
app = FastAPI(
    title="OrbitGuard API",
    description="AI-Powered Orbital Intelligence Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS Configuration ─────────────────────────────────────────────
# Allow all origins for development (restrict in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Include Routes ──────────────────────────────────────────────────
app.include_router(satellites.router)
app.include_router(analysis.router)


# ─── Root Endpoint ───────────────────────────────────────────────────
@app.get("/")
async def root():
    """API health check and info."""
    return {
        "service": "OrbitGuard API",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": {
            "satellites": "/api/satellites",
            "analysis": "/api/analysis",
            "docs": "/docs",
        }
    }


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "orbitguard-api"}


# ─── Exception Handlers ─────────────────────────────────────────────
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={"error": "Not found", "detail": str(exc.detail) if hasattr(exc, 'detail') else "Resource not found"}
    )


@app.exception_handler(500)
async def internal_error_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": "An unexpected error occurred"}
    )


# ─── Run with uvicorn ───────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("server.main:app", host="0.0.0.0", port=port, reload=True)
