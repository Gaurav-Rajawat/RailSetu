from fastapi import FastAPI

app = FastAPI(title="RailSetu Backend")

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
