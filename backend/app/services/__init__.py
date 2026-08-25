"""
Services Package

This package encapsulates the core business logic of the RailSetu application.
Services orchestrate database operations, communicate with external services,
and process data away from the route handlers.
"""

from .report_repo import BaseReportRepository, InMemoryReportRepository, get_report_repository
from .report_service import ReportService, get_report_service

