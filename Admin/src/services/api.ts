import axios from 'axios';
import { mockDb, zoneDivisions } from './mockData';
import {
  Corridor,
  Asset,
  ProblemReport,
  MaintenanceTask,
  Block,
  CorridorCoordinationGroup,
  DashboardStats,
  Severity,
  BlockStatus,
  WorkOrder,
  CrewTeam,
  ComponentWearTelemetry,
  VibrationTelemetryPoint,
  ZoneDivision,
} from '../types/railway';

// Base Axios instance ready for future FastAPI endpoint
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Role': 'CONTROL_SUPERVISOR',
  },
});

// Helper to simulate realistic industrial network telemetry delay (150-350ms)
const simulateLatency = <T>(fn: () => T, minMs = 150, maxMs = 350): Promise<T> => {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1) + minMs);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(fn());
      } catch (err) {
        reject(err);
      }
    }, delay);
  });
};

// ==========================================
// RAILWAY CONTROL CENTER API SERVICES
// ==========================================

export const railwayApi = {
  // 1. Dashboard Overview Stats & Live Telemetry
  getDashboardStats: async (): Promise<DashboardStats> => {
    return simulateLatency(() => {
      const reports = mockDb.getReports();
      const blocks = mockDb.getBlocks();
      const corridors = mockDb.getCorridors();
      const tasks = mockDb.getTasks();
      const workOrders = mockDb.getWorkOrders();

      const criticalReportsOpen = reports.filter(
        r => (r.confirmedSeverity || r.aiSeverity) === 'CRITICAL' && r.status !== 'CONVERTED'
      ).length;

      const activeBlocksThisWeek = blocks.filter(
        b => b.status === 'APPROVED' || b.status === 'RECOMMENDED'
      ).length;

      const activeWorkOrdersCount = workOrders.filter(
        w => w.status === 'IN_PROGRESS' || w.status === 'DISPATCHED' || w.status === 'PENDING_PARTS'
      ).length;

      const corridorHealth = {
        healthy: corridors.filter(c => c.healthStatus === 'HEALTHY').length,
        warning: corridors.filter(c => c.healthStatus === 'WARNING').length,
        critical: corridors.filter(c => c.healthStatus === 'CRITICAL').length,
      };

      const backlogCount = tasks.filter(t => t.status === 'PENDING').length;

      return {
        criticalReportsOpen,
        activeBlocksThisWeek,
        activeWorkOrdersCount,
        fleetHealthIndex: 98.4,
        resolutionRate: 94.2,
        corridorHealth,
        backlogCount,
      };
    });
  },

  // 2. Corridors
  getCorridors: async (): Promise<Corridor[]> => {
    return simulateLatency(() => mockDb.getCorridors());
  },

  // 3. Assets
  getAssets: async (corridorId?: string): Promise<Asset[]> => {
    return simulateLatency(() => {
      const assets = mockDb.getAssets();
      if (corridorId && corridorId !== 'ALL') {
        return assets.filter(a => a.corridorId === corridorId);
      }
      return assets;
    });
  },

  // 4. Problem Reports (Live Defect Reports)
  getReports: async (filters?: {
    corridorId?: string;
    severity?: string;
    status?: string;
    search?: string;
  }): Promise<ProblemReport[]> => {
    return simulateLatency(() => {
      let reports = mockDb.getReports();

      if (filters?.corridorId && filters.corridorId !== 'ALL') {
        reports = reports.filter(r => r.corridorId === filters.corridorId);
      }

      if (filters?.severity && filters.severity !== 'ALL') {
        reports = reports.filter(
          r => (r.confirmedSeverity || r.aiSeverity) === filters.severity
        );
      }

      if (filters?.status && filters.status !== 'ALL') {
        reports = reports.filter(r => r.status === filters.status);
      }

      if (filters?.search) {
        const query = filters.search.toLowerCase();
        reports = reports.filter(
          r =>
            r.id.toLowerCase().includes(query) ||
            r.description.toLowerCase().includes(query) ||
            r.assetId.toLowerCase().includes(query)
        );
      }

      // Sort newest first
      return reports.sort(
        (a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()
      );
    });
  },

  getReportById: async (id: string): Promise<ProblemReport | undefined> => {
    return simulateLatency(() => mockDb.getReportById(id));
  },

  updateReportSeverity: async (
    reportId: string,
    confirmedSeverity: Severity
  ): Promise<ProblemReport> => {
    return simulateLatency(() => mockDb.updateReportSeverity(reportId, confirmedSeverity));
  },

  convertReportToTask: async (
    reportId: string,
    department: 'TRACK' | 'SIGNAL' | 'OHE',
    durationMinutes: number
  ): Promise<MaintenanceTask> => {
    return simulateLatency(() =>
      mockDb.convertReportToTask(reportId, department, durationMinutes)
    );
  },

  // 5. Work Orders Management
  getWorkOrders: async (filters?: {
    corridorId?: string;
    department?: string;
    status?: string;
    search?: string;
  }): Promise<WorkOrder[]> => {
    return simulateLatency(() => {
      let wos = mockDb.getWorkOrders();

      if (filters?.corridorId && filters.corridorId !== 'ALL') {
        wos = wos.filter(w => w.corridorId === filters.corridorId);
      }

      if (filters?.department && filters.department !== 'ALL') {
        wos = wos.filter(w => w.department === filters.department);
      }

      if (filters?.status && filters.status !== 'ALL') {
        wos = wos.filter(w => w.status === filters.status);
      }

      if (filters?.search) {
        const query = filters.search.toLowerCase();
        wos = wos.filter(
          w =>
            w.id.toLowerCase().includes(query) ||
            w.assetTrack.toLowerCase().includes(query) ||
            w.issueType.toLowerCase().includes(query) ||
            w.assignedCrew.toLowerCase().includes(query)
        );
      }

      return wos;
    });
  },

  updateWorkOrderStatus: async (
    workOrderId: string,
    status: WorkOrder['status'],
    progressPercent?: number
  ): Promise<WorkOrder> => {
    return simulateLatency(() =>
      mockDb.updateWorkOrderStatus(workOrderId, status, progressPercent)
    );
  },

  // 6. Crew Dispatch
  getCrewTeams: async (): Promise<CrewTeam[]> => {
    return simulateLatency(() => mockDb.getCrewTeams());
  },

  dispatchCrew: async (
    alertId: string,
    crewId: string,
    notes?: string
  ): Promise<WorkOrder> => {
    return simulateLatency(() =>
      mockDb.dispatchCrewToAlert(alertId, crewId, notes)
    );
  },

  // 7. Predictive Telemetry
  getComponentWear: async (): Promise<ComponentWearTelemetry> => {
    return simulateLatency(() => mockDb.getComponentWear());
  },

  getVibrationSeries: async (): Promise<VibrationTelemetryPoint[]> => {
    return simulateLatency(() => mockDb.getVibrationSeries());
  },

  // 8. Zone Divisions
  getZoneDivisions: async (): Promise<ZoneDivision[]> => {
    return simulateLatency(() => zoneDivisions);
  },

  // 9. Maintenance Tasks & Coordination Center
  getTasks: async (corridorId?: string): Promise<MaintenanceTask[]> => {
    return simulateLatency(() => {
      const tasks = mockDb.getTasks();
      if (corridorId && corridorId !== 'ALL') {
        return tasks.filter(t => t.corridorId === corridorId);
      }
      return tasks;
    });
  },

  getCoordinationOpportunities: async (): Promise<CorridorCoordinationGroup[]> => {
    return simulateLatency(() => {
      const corridors = mockDb.getCorridors();
      const allTasks = mockDb.getTasks();

      const groups: CorridorCoordinationGroup[] = [];

      corridors.forEach(corridor => {
        const corridorTasks = allTasks.filter(
          t => t.corridorId === corridor.id && (t.status === 'PENDING' || t.status === 'COORDINATED')
        );

        if (corridorTasks.length > 0) {
          const depts = Array.from(new Set(corridorTasks.map(t => t.department))) as (
            | 'TRACK'
            | 'SIGNAL'
            | 'OHE'
          )[];

          const totalSeparateDuration = corridorTasks.reduce(
            (acc, t) => acc + t.durationMinutes,
            0
          );
          const maxIndividual = Math.max(...corridorTasks.map(t => t.durationMinutes), 0);
          const combinedDuration = Math.round(maxIndividual * 1.15 + (corridorTasks.length > 1 ? 15 : 0));
          const timeSavedMinutes = Math.max(0, totalSeparateDuration - combinedDuration);

          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const tomorrowStr = tomorrow.toISOString().split('T')[0];

          groups.push({
            corridor,
            tasks: corridorTasks,
            departments: depts,
            totalSeparateDuration,
            combinedDuration,
            timeSavedMinutes,
            suggestedSlot: {
              startTime: `${tomorrowStr}T01:30:00.000Z`,
              endTime: `${tomorrowStr}T04:00:00.000Z`,
            },
          });
        }
      });

      return groups;
    });
  },

  proposeBlock: async (data: {
    corridorId: string;
    taskIds: string[];
    startTime: string;
    endTime: string;
  }): Promise<Block> => {
    return simulateLatency(() => mockDb.proposeBlock(data));
  },

  // 10. Blocks Planning
  getBlocks: async (status?: BlockStatus | 'ALL'): Promise<Block[]> => {
    return simulateLatency(() => {
      const blocks = mockDb.getBlocks();
      if (status && status !== 'ALL') {
        return blocks.filter(b => b.status === status);
      }
      return blocks;
    });
  },

  updateBlockStatus: async (
    blockId: string,
    status: BlockStatus
  ): Promise<Block> => {
    return simulateLatency(() => mockDb.updateBlockStatus(blockId, status));
  },

  updateBlockTime: async (
    blockId: string,
    startTime: string,
    endTime: string
  ): Promise<Block> => {
    return simulateLatency(() => mockDb.updateBlockTime(blockId, startTime, endTime));
  },
};
