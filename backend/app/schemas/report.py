from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field

class ReportStatus(str, Enum):
    PENDING = "pending"
    INVESTIGATING = "investigating"
    RESOLVED = "resolved"
    DISMISSED = "dismissed"

class ReportSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"
    UNKNOWN = "unknown"

class ReportCategory(str, Enum):
    TRACK = "TRACK"
    SIGNAL = "SIGNAL"
    TRACTION_OHE = "TRACTION_OHE"
    OTHER = "OTHER"

class ReportBase(BaseModel):
    category: ReportCategory = Field(ReportCategory.OTHER, description="Category of the railway issue")
    photo_url: Optional[str] = Field(None, description="URL or reference key to the stored photo")
    latitude: float = Field(..., ge=-90.0, le=90.0, description="GPS latitude coordinates (-90 to 90)")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="GPS longitude coordinates (-180 to 180)")
    description: str = Field(..., min_length=1, description="Detailed description of the report/issue")
    timestamp: Optional[datetime] = Field(None, description="Timestamp of when the issue was reported/observed")
    reporter_id: Optional[str] = Field(None, description="Unique identifier of the reporting worker")

class ReportCreate(ReportBase):
    pass

class ReportUpdate(BaseModel):
    status: Optional[ReportStatus] = Field(None, description="Update status of the report")
    severity: Optional[ReportSeverity] = Field(None, description="Update severity level of the report")
    category: Optional[ReportCategory] = Field(None, description="Update category of the report")
    description: Optional[str] = Field(None, min_length=1, description="Update report description")
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0, description="Update GPS latitude")
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0, description="Update GPS longitude")
    photo_url: Optional[str] = Field(None, description="Update photo URL")

class ReportResponse(ReportBase):
    id: str = Field(..., description="Unique UUID identifier for the report")
    serverId: str = Field(..., description="Alias of id for mobile app client sync compatibility")
    status: ReportStatus = Field(..., description="Current status of the report")
    severity: ReportSeverity = Field(..., description="Assessed severity level")
    created_at: datetime = Field(..., description="Record creation timestamp")
    updated_at: datetime = Field(..., description="Record last updated timestamp")

    class Config:
        from_attributes = True
