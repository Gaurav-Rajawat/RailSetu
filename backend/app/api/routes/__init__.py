"""
Routes Package

This package contains all the API route modules (endpoints) for the RailSetu application.
Individual route files define specific resource routers (e.g., auth, trains, blocks, alerts).
All individual routers are aggregated and exposed here.
"""

from fastapi import APIRouter
from .auth import router as auth_router
from .trains import router as trains_router
from .blocks import router as blocks_router
from .alerts import router as alerts_router
from .reports import router as reports_router
from .websockets import router as websockets_router

api_router = APIRouter()

# Register sub-routers
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(trains_router, prefix="/trains", tags=["trains"])
api_router.include_router(blocks_router, prefix="/blocks", tags=["blocks"])
api_router.include_router(alerts_router, prefix="/alerts", tags=["alerts"])
api_router.include_router(reports_router, prefix="/reports", tags=["reports"])
api_router.include_router(websockets_router, prefix="/ws", tags=["websockets"])
