import { useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, useMap, Tooltip } from 'react-leaflet';
import { Corridor, ProblemReport } from '@/types/railway';
import { corridorCoordinates } from '@/services/mockData';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatDateTime } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';
import { Gauge, Weight } from 'lucide-react';

interface RailwayMapProps {
  corridors: Corridor[];
  reports: ProblemReport[];
  activeCorridorId?: string;
  selectedReportId?: string | null;
  height?: string;
  className?: string;
}

// Controller component to smoothly pan/zoom when active corridor or selected report changes
function MapController({
  activeCorridorId,
  selectedReportId,
  reports,
}: {
  activeCorridorId?: string;
  selectedReportId?: string | null;
  reports: ProblemReport[];
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedReportId) {
      const report = reports.find((r) => r.id === selectedReportId);
      if (report && report.gps) {
        map.flyTo([report.gps.lat, report.gps.lng], 13, { duration: 1 });
        return;
      }
    }

    if (activeCorridorId && activeCorridorId !== 'ALL') {
      const coords = corridorCoordinates[activeCorridorId]?.coordinates;
      if (coords && coords.length > 0) {
        map.flyToBounds(coords as [number, number][], {
          padding: [40, 40],
          duration: 1,
        });
        return;
      }
    }

    // Default pan to India central view
    map.setView([22.5, 78.5], 5);
  }, [activeCorridorId, selectedReportId, map, reports]);

  return null;
}

export function RailwayMap({
  corridors,
  reports,
  activeCorridorId = 'ALL',
  selectedReportId = null,
  height = '380px',
  className = '',
}: RailwayMapProps) {
  const { setSelectedReportId, theme } = useUIStore();
  const navigate = useNavigate();

  // Helper to color corridors
  const getCorridorColor = (corridor: Corridor) => {
    switch (corridor.healthStatus) {
      case 'CRITICAL':
        return '#EF4444'; // Crimson Red
      case 'WARNING':
        return '#F59E0B'; // Amber
      case 'HEALTHY':
        return '#10B981'; // Emerald Green
      default:
        return '#64748b';
    }
  };

  // Helper for report marker color
  const getSeverityMarkerColor = (report: ProblemReport) => {
    const sev = report.confirmedSeverity || report.aiSeverity;
    switch (sev) {
      case 'CRITICAL':
        return '#EF4444';
      case 'HIGH':
        return '#F97316';
      case 'MEDIUM':
        return '#F59E0B';
      case 'LOW':
        return '#3B82F6';
      default:
        return '#94a3b8';
    }
  };

  const filteredReports =
    activeCorridorId === 'ALL'
      ? reports
      : reports.filter((r) => r.corridorId === activeCorridorId);

  // Map Tile URL based on current theme
  const tileUrl =
    theme === 'dark'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  return (
    <div
      style={{ height }}
      className={`relative w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#0B0F19] overflow-hidden ${className}`}
    >
      {/* Control overlay header badge */}
      <div className="absolute top-2.5 right-2.5 z-[400] bg-white/90 dark:bg-[#111827]/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded text-[10px] font-mono text-slate-700 dark:text-slate-300 pointer-events-none flex items-center gap-2 shadow-sm">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
        <span>GIS TRACK TELEMETRY: ACTIVE &bull; {filteredReports.length} DEFECT PINS</span>
      </div>

      <MapContainer
        center={[22.5, 78.5]}
        zoom={5}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          key={theme} // re-render tiles on theme switch
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={tileUrl}
          maxZoom={19}
        />

        <MapController
          activeCorridorId={activeCorridorId}
          selectedReportId={selectedReportId}
          reports={reports}
        />

        {/* Corridor Route Polylines */}
        {corridors.map((corridor) => {
          const coords = corridorCoordinates[corridor.id]?.coordinates;
          if (!coords) return null;

          const isDimmed = activeCorridorId !== 'ALL' && activeCorridorId !== corridor.id;
          const color = getCorridorColor(corridor);

          // Simulated stress index & load for tooltips
          const stressIndex = corridor.id === 'C04' ? '0.88 MPa (Critical)' : corridor.id === 'C12' ? '0.72 MPa (Caution)' : '0.41 MPa (Nominal)';
          const loadTons = corridor.id === 'C04' ? '32.5 Axle Tons' : corridor.id === 'C12' ? '28.0 Axle Tons' : '22.4 Axle Tons';

          return (
            <Fragment key={corridor.id}>
              {/* Outer pulsing glow line */}
              <Polyline
                positions={coords}
                pathOptions={{
                  color,
                  weight: isDimmed ? 2 : 6,
                  opacity: isDimmed ? 0.15 : 0.45,
                  dashArray: corridor.healthStatus === 'CRITICAL' ? '6, 6' : undefined,
                }}
              />
              {/* Core railway vector line */}
              <Polyline
                positions={coords}
                pathOptions={{
                  color: isDimmed ? (theme === 'dark' ? '#334155' : '#cbd5e1') : color,
                  weight: isDimmed ? 2 : 3.5,
                  opacity: isDimmed ? 0.3 : 0.95,
                }}
              >
                {/* Interactive Tooltip on Hover */}
                <Tooltip sticky direction="top" className="custom-leaflet-tooltip">
                  <div className="p-2 font-sans text-xs bg-slate-900 text-white rounded border border-slate-700 shadow-xl space-y-1">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono font-bold text-sky-400">[{corridor.id}] {corridor.name}</span>
                      <span className="text-[10px] font-mono px-1 rounded bg-slate-800 text-slate-300">{corridor.healthStatus}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-mono text-slate-300 pt-0.5 border-t border-slate-800">
                      <span className="flex items-center gap-1">
                        <Gauge className="h-3 w-3 text-amber-400" />
                        Stress: {stressIndex}
                      </span>
                      <span className="flex items-center gap-1">
                        <Weight className="h-3 w-3 text-blue-400" />
                        Load: {loadTons}
                      </span>
                    </div>
                  </div>
                </Tooltip>

                {/* Rich Popup on Click */}
                <Popup>
                  <div className="p-3 font-sans min-w-[220px] bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100 rounded">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-mono text-xs font-bold text-blue-600 dark:text-sky-400">
                        {corridor.id}
                      </span>
                      <StatusBadge status={corridor.healthStatus} showIcon={false} />
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{corridor.name}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{corridor.section}</div>

                    <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] font-mono space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Track Stress:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{stressIndex}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Axle Load:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{loadTons}</span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Polyline>
            </Fragment>
          );
        })}

        {/* Problem Report Defect Markers */}
        {filteredReports.map((report) => {
          if (!report.gps) return null;
          const markerColor = getSeverityMarkerColor(report);
          const isSelected = selectedReportId === report.id;

          return (
            <CircleMarker
              key={report.id}
              center={[report.gps.lat, report.gps.lng]}
              radius={isSelected ? 10 : 6}
              pathOptions={{
                color: isSelected ? '#ffffff' : markerColor,
                fillColor: markerColor,
                fillOpacity: 0.95,
                weight: isSelected ? 3 : 1.5,
              }}
            >
              <Popup>
                <div className="p-3 font-sans max-w-[280px] bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100 rounded">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                      {report.id}
                    </span>
                    <StatusBadge
                      status={report.confirmedSeverity || report.aiSeverity}
                      showIcon={false}
                    />
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1">
                    CORRIDOR: {report.corridorId} | ASSET: {report.assetId}
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-200 line-clamp-2 mb-2 leading-relaxed">
                    {report.description}
                  </p>
                  <div className="text-[10px] text-slate-400 font-mono mb-2">
                    {formatDateTime(report.reportedAt)}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedReportId(report.id);
                      navigate('/reports');
                    }}
                    className="w-full text-center py-1 px-2 text-[11px] uppercase tracking-wider font-mono font-bold bg-blue-600 hover:bg-blue-500 text-white rounded border border-blue-400 shadow-sm"
                  >
                    Inspect Report &rarr;
                  </button>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
