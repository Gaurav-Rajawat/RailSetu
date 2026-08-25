"""
Schemas Package

This package contains all Pydantic models used for data validation, serialization, and
deserialization in RailSetu APIs (Request and Response bodies).
"""

from .report import (
    ReportStatus,
    ReportSeverity,
    ReportCategory,
    ReportBase,
    ReportCreate,
    ReportUpdate,
    ReportResponse,
)

