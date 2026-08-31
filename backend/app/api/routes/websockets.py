from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websocket.manager import manager
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.websocket("/admin")
async def websocket_admin_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # We don't expect the client to send messages, but we need to keep the connection open
            # and listen for disconnects
            data = await websocket.receive_text()
            logger.info(f"Received message from admin WS: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)
