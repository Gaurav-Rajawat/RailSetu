# RailSetu Backend

This is the foundational FastAPI backend for the RailSetu project.

## Project Structure

- `app/main.py`: The core FastAPI application instance and basic route definitions (`/` and `/health`).
- `requirements.txt`: Python package dependencies needed for the backend (FastAPI and Uvicorn).
- `.env.example`: A template file for environment variables. You can copy it to `.env` when you need to store secrets locally.
- `README.md`: This documentation file.

## Getting Started

1. **Set up a virtual environment** (recommended):
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   # source venv/bin/activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the development server**:
   ```bash
   # From the backend directory (use --host 0.0.0.0 so physical mobile devices on Wi-Fi can connect)
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

The application will be available at `http://127.0.0.1:8000`. You can also view the interactive API documentation at `http://127.0.0.1:8000/docs`.
