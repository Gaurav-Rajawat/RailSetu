from typing import List
import json
import re
from email.parser import BytesParser
from email.policy import default
from fastapi import APIRouter, Request, Depends, HTTPException, status
from pydantic import ValidationError
from app.schemas.report import ReportCreate, ReportUpdate, ReportResponse
from app.services.report_service import ReportService, get_report_service

router = APIRouter()

@router.post(
    "", 
    response_model=ReportResponse, 
    status_code=status.HTTP_201_CREATED,
    openapi_extra={
        "requestBody": {
            "content": {
                "application/json": {
                    "schema": {
                        "type": "object",
                        "properties": {
                            "category": {"type": "string", "default": "OTHER"},
                            "photo_url": {"type": "string"},
                            "latitude": {"type": "number", "default": 28.6139},
                            "longitude": {"type": "number", "default": 77.2090},
                            "description": {"type": "string", "default": "Sample report description"},
                            "timestamp": {"type": "string", "format": "date-time"},
                            "reporter_id": {"type": "string", "default": "worker_101"}
                        },
                        "required": ["latitude", "longitude", "description"]
                    }
                }
            }
        }
    }
)
async def create_report(
    request: Request,
    service: ReportService = Depends(get_report_service)
):
    """
    (for mobile client upload of binary photo).
    Does not require external python-multipart library (uses Python built-in parser).
    """
    content_type = request.headers.get("content-type", "")
    
    if "multipart/form-data" in content_type:
        body = await request.body()
        
        # Prepend content type header so BytesParser knows the boundary
        msg_bytes = f"Content-Type: {content_type}\r\n\r\n".encode("utf-8") + body
        msg = BytesParser(policy=default).parsebytes(msg_bytes)
        
        form_data = {}
        files = {}
        
        if msg.is_multipart():
            for part in msg.iter_parts():
                disposition = part.get("Content-Disposition", "")
                if "form-data" in disposition:
                    name_match = re.search(r'name="([^"]+)"', disposition)
                    filename_match = re.search(r'filename="([^"]+)"', disposition)
                    if name_match:
                        name = name_match.group(1)
                        if filename_match:
                            filename = filename_match.group(1)
                            payload = part.get_payload(decode=True)
                            files[name] = (filename, payload)
                        else:
                            payload = part.get_payload(decode=True)
                            form_data[name] = payload.decode("utf-8").strip() if payload else ""
                            
        description = form_data.get("description")
        lat_val = form_data.get("latitude")
        lng_val = form_data.get("longitude")
        
        if description is None or lat_val is None or lng_val is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="description, latitude, and longitude are required fields."
            )
            
        try:
            latitude = float(str(lat_val))
            longitude = float(str(lng_val))
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="latitude and longitude must be valid floating point numbers."
            )
            
        # File parsing
        photo_url = None
        photo_file = files.get("photo")
        if photo_file:
            filename, _ = photo_file
            # Under a cloud production environment, we would stream this upload to S3/GCS.
            # For this task, we store a reference URL to local static uploads.
            photo_url = f"/uploads/{filename}"
            
        # Optional parameters
        category_str = form_data.get("category") or "OTHER"
        severity_str = form_data.get("severity")
        reporter_id = form_data.get("reporter_id") or form_data.get("id")
        
        try:
            report_in = ReportCreate(
                category=category_str, # type: ignore
                photo_url=photo_url,
                latitude=latitude,
                longitude=longitude,
                description=str(description),
                reporter_id=str(reporter_id) if reporter_id else None,
                severity=severity_str # type: ignore
            )
        except ValidationError as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=e.errors()
            )
    else:
        try:
            body = await request.json()
            report_in = ReportCreate(**body)
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid JSON payload."
            )
        except ValidationError as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=e.errors()
            )
            
    return service.create_report(report_in)


@router.get("", response_model=List[ReportResponse])
def list_reports(
    service: ReportService = Depends(get_report_service)
):
    """
    Retrieve all reports. Sorted from newest to oldest. Used by the admin dashboard.
    """
    return service.list_reports()


@router.get("/{report_id}", response_model=ReportResponse)
def get_report(
    report_id: str,
    service: ReportService = Depends(get_report_service)
):
    """
    Get details of a specific report.
    """
    return service.get_report(report_id)


@router.patch("/{report_id}", response_model=ReportResponse)
def update_report(
    report_id: str,
    update_data: ReportUpdate,
    service: ReportService = Depends(get_report_service)
):
    """
    Update details of a report (e.g. updating status/severity by administrators).
    """
    return service.update_report(report_id, update_data)
