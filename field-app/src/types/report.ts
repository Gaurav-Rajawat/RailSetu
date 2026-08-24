export type ReportCategory = 'TRACK' | 'SIGNAL' | 'TRACTION_OHE' | 'OTHER';
export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'failed';
export type ReportStatus = 'SUBMITTED' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED';

export interface Report {
  id: string;
  serverId: string | null;
  category: ReportCategory;
  description: string;
  latitude: number;
  longitude: number;
  gpsAccuracy: number;
  photoUri: string;
  voiceNoteUri: string | null;
  capturedAt: string;
  syncStatus: SyncStatus;
  status: ReportStatus;
  createdAt: string;
  retryCount: number;
  nextRetryAt: string | null;
}
