from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import Dict, List, Optional
import uuid

class BaseReportRepository(ABC):
    """
    Interface for Report repository.
    This defines the contract that the real database repository must implement.
    """
    @abstractmethod
    def create(self, report_data: dict) -> dict:
        pass

    @abstractmethod
    def get_by_id(self, report_id: str) -> Optional[dict]:
        pass

    @abstractmethod
    def list_all(self) -> List[dict]:
        pass

    @abstractmethod
    def update(self, report_id: str, update_data: dict) -> Optional[dict]:
        pass


class InMemoryReportRepository(BaseReportRepository):
    """
    In-memory mock database implementation of the report repository.
    Perfect for unit testing and running the application without PostgreSQL connected.
    """
    def __init__(self):
        # Maps report_id (str) -> report_data (dict)
        self._db: Dict[str, dict] = {}

    def create(self, report_data: dict) -> dict:
        now = datetime.now(timezone.utc)
        report_id = str(uuid.uuid4())
        
        # Populate DB fields
        record = {
            **report_data,
            "id": report_id,
            "serverId": report_id,  # Set serverId for client-sync compatibility
            "status": report_data.get("status") or "pending",
            "severity": report_data.get("severity") or "unknown",
            "timestamp": report_data.get("timestamp") or now,
            "created_at": now,
            "updated_at": now
        }
        self._db[report_id] = record
        return record

    def get_by_id(self, report_id: str) -> Optional[dict]:
        return self._db.get(report_id)

    def list_all(self) -> List[dict]:
        # Return sorted by created_at descending (newest first)
        return sorted(self._db.values(), key=lambda x: x["created_at"], reverse=True)

    def update(self, report_id: str, update_data: dict) -> Optional[dict]:
        record = self._db.get(report_id)
        if not record:
            return None
        
        # Merge update fields
        for key, val in update_data.items():
            if val is not None:
                record[key] = val
        
        record["updated_at"] = datetime.now(timezone.utc)
        self._db[report_id] = record
        return record

# Single global instance of in-memory repo representing our current "database" state.
# In a real app with Dependency Injection, this would be scoped to request or lifetime.
_global_report_repo = InMemoryReportRepository()

def get_report_repository() -> BaseReportRepository:
    """
    Dependency generator function that returns the report repository instance.
    The FastAPI route handlers can inject this using Depends(get_report_repository).
    To switch to database persistence, change this function to return SQLReportRepository instead.
    """
    return _global_report_repo
