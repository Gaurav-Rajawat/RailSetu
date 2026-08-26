export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type BlockStatus = "RECOMMENDED" | "APPROVED" | "REJECTED" | "MODIFIED";
export type WorkOrderStatus = "IN_PROGRESS" | "DISPATCHED" | "PENDING_PARTS" | "COMPLETED" | "SCHEDULED";
export type WorkOrderPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface Corridor {
  id: string;          // e.g. "C12"
  name: string;
  section: string;
  healthStatus: "HEALTHY" | "WARNING" | "CRITICAL";
  stressIndex?: number; // 0.0 - 1.0
  loadTons?: number;    // e.g. 28.5
  lengthKm?: number;
  activeTrains?: number;
}

export interface Asset {
  id: string;
  corridorId: string;
  type: "TRACK" | "SIGNAL" | "OHE";
  name: string;
  status: "HEALTHY" | "WARNING" | "CRITICAL";
  lastInspectionDate?: string;
  nextScheduledMaintenance?: string;
}

export interface ProblemReport {
  id: string;           // e.g. "REP-1001"
  assetId: string;
  corridorId: string;
  description: string;
  photoUrl: string;
  gps: { lat: number; lng: number };
  aiSeverity: Severity;
  aiConfidence: number; // 0-1
  confirmedSeverity: Severity | null;
  status: "NEW" | "REVIEWED" | "CONVERTED";
  reportedAt: string;   // ISO timestamp
  trackKm?: string;
  suggestedAction?: string;
}

export interface MaintenanceTask {
  id: string;
  reportId: string;
  department: "TRACK" | "SIGNAL" | "OHE";
  corridorId: string;
  durationMinutes: number;
  priority: number;     // 0-100
  status: "PENDING" | "COORDINATED" | "SCHEDULED" | "DONE";
}

export interface Block {
  id: string;
  corridorId: string;
  taskIds: string[];    // multiple tasks = coordinated block
  startTime: string;
  endTime: string;
  status: BlockStatus;
  departmentsInvolved: string[];
}

export interface CorridorCoordinationGroup {
  corridor: Corridor;
  tasks: MaintenanceTask[];
  departments: ("TRACK" | "SIGNAL" | "OHE")[];
  totalSeparateDuration: number;
  combinedDuration: number;
  timeSavedMinutes: number;
  suggestedSlot: {
    startTime: string;
    endTime: string;
  };
}

export interface DashboardStats {
  criticalReportsOpen: number;
  activeBlocksThisWeek: number;
  activeWorkOrdersCount: number;
  fleetHealthIndex: number; // e.g. 98.4
  resolutionRate: number;   // e.g. 94.2
  corridorHealth: {
    healthy: number;
    warning: number;
    critical: number;
  };
  backlogCount: number;
}

export interface WorkOrder {
  id: string;              // e.g. "WO-8492"
  assetTrack: string;      // e.g. "TRK-C12-KM104"
  corridorId: string;      // "C12"
  issueType: string;       // e.g. "Rail Head Spalling"
  department: "TRACK" | "SIGNAL" | "OHE";
  priority: WorkOrderPriority;
  assignedCrew: string;    // e.g. "Gang 14 (P-Way)"
  status: WorkOrderStatus;
  reportedAt: string;
  estimatedDurationHours: number;
  progressPercent: number;
  actionRequired: string;
  zone: string;
}

export interface CrewTeam {
  id: string;
  name: string;
  department: "TRACK" | "SIGNAL" | "OHE";
  leadName: string;
  membersCount: number;
  contactNumber: string;
  status: "AVAILABLE" | "DISPATCHED" | "ON_STANDBY" | "OFF_DUTY";
  currentLocation: string;
  activeWorkOrderId?: string;
  etaMinutes?: number;
}

export interface ComponentWearTelemetry {
  brakePadsWear: number;       // % worn e.g. 74% (Warn > 70%, Crit > 85%)
  wheelProfileWear: number;    // % flange wear e.g. 58%
  pantographStripWear: number; // % carbon strip wear e.g. 82%
  brakePadKmRemaining: number;
  wheelProfileKmRemaining: number;
  pantographKmRemaining: number;
  monitoredUnitsCount: number;
  criticalUnitsCount: number;
}

export interface VibrationTelemetryPoint {
  time: string;
  trackVibration: number;   // g-force peak (e.g. 0.32g - 1.15g)
  stressFrequency: number;  // Hz (e.g. 24Hz - 68Hz)
  acousticAnomaly: number;  // dB index (e.g. 45dB - 92dB)
  baselineVibration: number;
}

export interface ZoneDivision {
  id: string;
  name: string;
  code: string;
  headquarters: string;
  activeCorridors: string[];
}
