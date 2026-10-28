import os
import time
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.routes import api_router

logger = logging.getLogger("railsetu.api")

app = FastAPI(
    title="RailSetu Backend",
    description="Unified API service for RailSetu Operations Control Center and Field Inspection applications.",
    version="1.0.0",
)

# Request execution timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.perf_counter()
    response = await call_next(request)
    process_time = time.perf_counter() - start_time
    response.headers["X-Process-Time"] = f"{process_time:.4f}s"
    return response

# Allow CORS for Flutter Web testing and Admin frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure uploads directory exists and mount it
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include API routes (handles /api/reports, /api/auth, /api/trains, etc.)
app.include_router(api_router, prefix="/api")

@app.get("/")
def read_root():
    """
    Root endpoint to verify the backend is running.
    """
    return {"message": "RailSetu Backend Running", "status": "online"}

@app.get("/health")
def health_check():
    """
    Health check endpoint to verify the application status.
    """
    return {"status": "healthy"}
