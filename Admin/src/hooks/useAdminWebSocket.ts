import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ProblemReport } from '../types/railway';
import { getFullImageUrl } from '../services/api';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://192.168.1.9:8000/api/ws/admin';

export function useAdminWebSocket() {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to Admin WebSocket');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WS event received:', data);

        if (data.type === 'report_created' || data.type === 'report_updated') {
          const r = data.report;
          
          const formattedReport: ProblemReport = {
            id: r.id,
            category: r.category,
            description: r.description,
            photoUrl: getFullImageUrl(r.photo_url),
            gps: { lat: r.latitude, lng: r.longitude },
            aiSeverity: (r.severity?.toUpperCase() || 'UNKNOWN') as any,
            aiConfidence: 0.95,
            confirmedSeverity: null,
            status: (r.status?.toUpperCase() || 'PENDING') as any,
            reportedAt: r.created_at || r.timestamp,
            reporterId: r.reporter_id || undefined,
          };

          queryClient.setQueriesData<ProblemReport[]>({ queryKey: ['reports'] }, (oldReports) => {
            if (!oldReports) return [formattedReport];
            
            if (data.type === 'report_created') {
              if (oldReports.find(existing => existing.id === formattedReport.id)) return oldReports;
              return [formattedReport, ...oldReports];
            } else if (data.type === 'report_updated') {
              return oldReports.map((existing) => 
                existing.id === formattedReport.id ? { ...existing, ...formattedReport } : existing
              );
            }
            return oldReports;
          });
        }
      } catch (err) {
        console.error('Error parsing WS message', err);
      }
    };

    ws.onclose = () => {
      console.log('Admin WebSocket disconnected.');
    };

    return () => {
      ws.close();
    };
  }, [queryClient]);
}
