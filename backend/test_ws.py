import asyncio
import websockets
import json
import httpx

async def test_ws():
    uri = "ws://localhost:8000/api/ws/admin"
    async with websockets.connect(uri) as websocket:
        print("Connected to WS")
        
        # Create report
        async with httpx.AsyncClient() as client:
            resp = await client.post("http://localhost:8000/api/reports", json={
                "category": "TRACK",
                "description": "Test report from agent",
                "latitude": 28.6139,
                "longitude": 77.2090,
                "severity": "high",
            })
            print("Create Response:", resp.status_code)
            report = resp.json()
            print("Created Report ID:", report.get("id"))
            
        # Receive WS msg
        msg = await websocket.recv()
        print("WS Received Create:", msg)
        
        # Update report
        async with httpx.AsyncClient() as client:
            resp = await client.patch(f"http://localhost:8000/api/reports/{report['id']}", json={
                "status": "investigating",
                "severity": "critical"
            })
            print("Update Response:", resp.status_code)
            
        # Receive WS msg
        msg = await websocket.recv()
        print("WS Received Update:", msg)

asyncio.run(test_ws())
