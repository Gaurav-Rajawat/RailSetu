import NetInfo from '@react-native-community/netinfo';
import { AppState, AppStateStatus } from 'react-native';
import { getPendingReports, updateReport } from './db';
import { useSyncStore } from '../store/syncStore';
import { reportApi } from './api';

let isSyncing = false;

const updatePendingCount = async () => {
  try {
    const pending = await getPendingReports();
    useSyncStore.getState().setPendingCount(pending.length);
  } catch (e) {
    console.error('Failed to update pending count', e);
  }
};

const syncPendingReports = async (manual = false) => {
  if (isSyncing) return;
  
  const { isOnline, setIsSyncing } = useSyncStore.getState();
  if (!isOnline && !manual) return;

  isSyncing = true;
  setIsSyncing(true);

  try {
    const reports = await getPendingReports();
    for (const report of reports) {
      const now = Date.now();
      const nextRetry = report.nextRetryAt ? new Date(report.nextRetryAt).getTime() : 0;
      
      // Skip if it's not time to retry yet, unless triggered manually
      if (!manual && now < nextRetry && report.syncStatus !== 'failed') {
        continue;
      }

      try {
        const res: any = await reportApi.submitReport(report);
        
        // Success: mark synced and save serverId
        await updateReport(report.id, { 
          serverId: res.serverId, 
          syncStatus: 'synced', 
          status: res.status || 'SUBMITTED',
          retryCount: 0,
          nextRetryAt: null
        });
      } catch (e) {
        console.error(`Sync failed for report ${report.id}`, e);
        const retryCount = (report.retryCount || 0) + 1;
        
        if (retryCount >= 5) {
          // Hard fail after 5 attempts
          await updateReport(report.id, { syncStatus: 'failed', retryCount });
        } else {
          // Exponential backoff: base 5s, max 5 minutes
          const backoffMs = Math.min(5000 * Math.pow(2, retryCount - 1), 5 * 60 * 1000);
          const nextTime = new Date(now + backoffMs).toISOString();
          await updateReport(report.id, { retryCount, nextRetryAt: nextTime, syncStatus: 'pending' });
        }
      }
    }
  } catch (e) {
    console.error('Error during sync run:', e);
  } finally {
    await updatePendingCount();
    isSyncing = false;
    setIsSyncing(false);
  }
};

export const syncManager = {
  init: () => {
    // Listen for network changes
    NetInfo.addEventListener(state => {
      const isConnected = !!state.isConnected;
      useSyncStore.getState().setOnline(isConnected);
      
      if (isConnected) {
        syncPendingReports();
      }
    });

    // Listen for app foregrounding
    let appState = AppState.currentState;
    AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        const { isOnline } = useSyncStore.getState();
        if (isOnline) {
          syncPendingReports();
        }
      }
      appState = nextAppState;
    });

    // Initial count
    updatePendingCount();
  },
  syncPendingReports,
  updatePendingCount,
};
