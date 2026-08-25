from fastapi import FastAPI
from app.api.routes import api_router

from app.api.routes.reports import router as reports_compatibility_router

app = FastAPI(title="RailSetu Backend")

# Include API routes (handles /api/reports, /api/auth, /api/trains, etc.)
app.include_router(api_router, prefix="/api")

# Compatibility route for the React Native field worker app (hits /reports)
app.include_router(reports_compatibility_router, prefix="/reports", tags=["reports-compatibility"])


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

