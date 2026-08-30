import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.routes import api_router

from app.api.routes.reports import router as reports_compatibility_router

app = FastAPI(title="RailSetu Backend")

# Allow CORS for Flutter Web testing
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
    return {"message": "RailSetu Backend Running"}

@app.get("/health")
def health_check():
    """
    Health check endpoint to verify the application status.
    """
    return {"status": "healthy"}

