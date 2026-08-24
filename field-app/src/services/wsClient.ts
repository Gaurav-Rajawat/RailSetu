import { WS_BASE_URL, MOCK_MODE } from '../config';
import { useAuthStore } from '../store/authStore';
import { useNotificationsStore } from '../store/notificationsStore';
import { getAllReports, updateReport } from './db';
import { v4 as uuidv4 } from 'uuid';
import { ReportStatus } from '../types/report';

let ws: WebSocket | null = null;
let mockInterval: ReturnType<typeof setInterval> | null = null;

const handleStatusUpdate = async (reportId: string, newStatus: ReportStatus) => {
  await updateReport(reportId, { status: newStatus });
  useNotificationsStore.getState().addNotification({
    id: uuidv4(),
    reportId,
    title: 'Status Updated',
    body: `Your report status changed to ${newStatus.replace('_', ' ')}`,
    timestamp: new Date().toISOString(),
    read: false,
  });
};

const handleBlockScheduled = async (reportId: string, window: string) => {
  useNotificationsStore.getState().addNotification({
    id: uuidv4(),
    reportId,
    title: 'Block Scheduled',
    body: `Block scheduled for window: ${window}`,
    timestamp: new Date().toISOString(),
    read: false,
  });
};

export const wsClient = {
  connect: () => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    if (MOCK_MODE) {
      if (mockInterval) clearInterval(mockInterval);
      mockInterval = setInterval(async () => {
        try {
          const reports = await getAllReports();
          const activeReports = reports.filter(r => r.status !== 'RESOLVED');
          if (activeReports.length > 0) {
            const randomReport = activeReports[Math.floor(Math.random() * activeReports.length)];
            let newStatus: ReportStatus = 'ACKNOWLEDGED';
            if (randomReport.status === 'ACKNOWLEDGED') newStatus = 'IN_PROGRESS';
            else if (randomReport.status === 'IN_PROGRESS') newStatus = 'RESOLVED';
            
            await handleStatusUpdate(randomReport.id, newStatus);
            
            // Randomly schedule a block sometimes
            if (Math.random() > 0.5) {
               await handleBlockScheduled(randomReport.id, '22:00 - 02:00');
            }
          }
        } catch (e) {
          console.error('Mock WS Error:', e);
        }
      }, 20000);
      return;
    }

    if (ws) {
      ws.close();
    }

    ws = new WebSocket(`${WS_BASE_URL}?token=${token}`);
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'STATUS_UPDATE') {
          handleStatusUpdate(data.reportId, data.newStatus);
        } else if (data.type === 'BLOCK_SCHEDULED') {
          handleBlockScheduled(data.reportId, data.window);
        }
      } catch (e) {
        console.error('WS parse error:', e);
      }
    };
    
    ws.onerror = (e) => {
      console.error('WS Error:', e);
    };

    ws.onclose = () => {
      // Reconnect logic
      setTimeout(() => {
        if (useAuthStore.getState().token) {
          wsClient.connect();
        }
      }, 5000);
    };
  },
  
  disconnect: () => {
    if (mockInterval) {
      clearInterval(mockInterval);
      mockInterval = null;
    }
    if (ws) {
      ws.onclose = null;
      ws.close();
      ws = null;
    }
  }
};
