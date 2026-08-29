from datetime import datetime, timezone
from typing import List, Optional
from fastapi import Depends, HTTPException, status
from app.schemas.report import ReportCreate, ReportUpdate, ReportResponse, ReportStatus, ReportSeverity
from app.services.report_repo import BaseReportRepository, get_report_repository

class ReportService:
    """
    Service Layer containing core business logic for RailSetu Reports.
    Coordinates between incoming route requests, business rules/validations,
    and database repositories.
    """
    def __init__(self, repo: BaseReportRepository):
        self.repo = repo

    def create_report(self, report_in: ReportCreate) -> ReportResponse:
        # Validate timestamp: cannot be in the future
        now = datetime.now(timezone.utc)
        report_timestamp = report_in.timestamp
        if report_timestamp:
            # If timestamp is naive, make it timezone-aware (assume UTC)
            if report_timestamp.tzinfo is None:
                report_timestamp = report_timestamp.replace(tzinfo=timezone.utc)
            if report_timestamp > now:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Report timestamp cannot be in the future."
                )
        else:
            report_timestamp = now

        # Convert schema input to database dict representation
        report_dict = report_in.model_dump()
        report_dict["timestamp"] = report_timestamp
        
        # Core Business Rule (Placeholder): 
        # Future AI model will determine severity based on description/photo.
        # For now, use provided severity or default to "unknown".
        report_dict["status"] = ReportStatus.PENDING
        report_dict["severity"] = report_in.severity if report_in.severity else ReportSeverity.UNKNOWN

        # Save to database repository
        created_record = self.repo.create(report_dict)

        # Future hooks go here (e.g. send real-time Websocket notification to admin dashboard, call AI analyzer)
        # self.websocket_manager.broadcast_new_report(created_record)
        # self.ai_classifier.classify_severity(created_record["id"])

        return ReportResponse.model_validate(created_record)

    def get_report(self, report_id: str) -> ReportResponse:
        record = self.repo.get_by_id(report_id)
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Report with ID '{report_id}' not found."
            )
        return ReportResponse.model_validate(record)

    def list_reports(self) -> List[ReportResponse]:
        records = self.repo.list_all()
        return [ReportResponse.model_validate(r) for r in records]

    def update_report(self, report_id: str, update_in: ReportUpdate) -> ReportResponse:
        # Check if report exists
        existing_record = self.repo.get_by_id(report_id)
        if not existing_record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Report with ID '{report_id}' not found."
            )

        # Convert schema input to dict (exclude unset parameters to avoid overriding with nulls)
        update_dict = update_in.model_dump(exclude_unset=True)
        if not update_dict:
            # Nothing to update, return existing
            return ReportResponse.model_validate(existing_record)

        # Perform the update in the repository
        updated_record = self.repo.update(report_id, update_dict)
        if not updated_record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Report with ID '{report_id}' not found during update."
            )

        # Future hooks (e.g. notify admin of status changes)
        return ReportResponse.model_validate(updated_record)


def get_report_service(
    repo: BaseReportRepository = Depends(get_report_repository)
) -> ReportService:
    """
    Dependency generator for ReportService.
    Ensures the service runs with the correct active repository implementation.
    """
    return ReportService(repo=repo)
