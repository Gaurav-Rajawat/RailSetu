import unittest
from fastapi.testclient import TestClient
from app.main import app

class TestReportsAPI(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_create_report_json(self):
        payload = {
            "category": "TRACK",
            "latitude": 28.6139,
            "longitude": 77.2090,
            "description": "Loose rail track joint found near platform 2.",
            "reporter_id": "worker_101"
        }
        response = self.client.post("/api/reports", json=payload)
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertIn("id", data)
        self.assertEqual(data["serverId"], data["id"])
        self.assertEqual(data["category"], "TRACK")
        self.assertEqual(data["latitude"], 28.6139)
        self.assertEqual(data["status"], "pending")
        self.assertEqual(data["severity"], "unknown")

    def test_create_report_invalid_coords(self):
        # Latitude out of bounds (should fail Pydantic validation)
        payload = {
            "latitude": 95.0,
            "longitude": 77.2090,
            "description": "Test report with invalid coordinates."
        }
        response = self.client.post("/api/reports", json=payload)
        self.assertEqual(response.status_code, 422)

    def test_create_report_multipart(self):
        # Simulate mobile app upload with multipart/form-data
        data = {
            "id": "client-uuid-1234",
            "category": "SIGNAL",
            "description": "Signal light flickering constantly.",
            "latitude": "12.9716",
            "longitude": "77.5946"
        }
        files = {
            "photo": ("photo.jpg", b"fake-binary-data", "image/jpeg")
        }
        response = self.client.post("/reports", data=data, files=files)
        self.assertEqual(response.status_code, 201)
        res_data = response.json()
        self.assertEqual(res_data["category"], "SIGNAL")
        self.assertEqual(res_data["photo_url"], "/uploads/photo.jpg")
        self.assertEqual(res_data["reporter_id"], "client-uuid-1234")

    def test_list_reports(self):
        response = self.client.get("/api/reports")
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json(), list)

    def test_get_report_by_id(self):
        payload = {
            "category": "OTHER",
            "latitude": 0.0,
            "longitude": 0.0,
            "description": "Detailed validation check report."
        }
        create_res = self.client.post("/api/reports", json=payload)
        report_id = create_res.json()["id"]

        get_res = self.client.get(f"/api/reports/{report_id}")
        self.assertEqual(get_res.status_code, 200)
        self.assertEqual(get_res.json()["id"], report_id)

    def test_get_report_not_found(self):
        response = self.client.get("/api/reports/non-existent-uuid-key")
        self.assertEqual(response.status_code, 404)

    def test_patch_report(self):
        payload = {
            "latitude": 0.0,
            "longitude": 0.0,
            "description": "Report to be updated."
        }
        create_res = self.client.post("/api/reports", json=payload)
        report_id = create_res.json()["id"]

        patch_payload = {
            "status": "investigating",
            "severity": "high"
        }
        patch_res = self.client.patch(f"/api/reports/{report_id}", json=patch_payload)
        self.assertEqual(patch_res.status_code, 200)
        updated_data = patch_res.json()
        self.assertEqual(updated_data["status"], "investigating")
        self.assertEqual(updated_data["severity"], "high")
