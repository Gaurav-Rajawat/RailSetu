import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { railwayApi } from '@/services/api';
import { useUIStore } from '@/store/uiStore';
import { ProblemReport, Severity } from '@/types/railway';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { SeverityIndicator } from '@/components/common/SeverityIndicator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatDateTime } from '@/lib/utils';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import {
  Search,
  CheckCircle2,
  AlertOctagon,
  ArrowUpDown,
  FileSpreadsheet,
  Layers,
  MapPin,
} from 'lucide-react';

// Fix leaflet marker icon in bundlers
const customPinIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export function LiveReportsPage() {
  const queryClient = useQueryClient();
  const {
    activeCorridorFilter,
    setActiveCorridorFilter,
    selectedReportId,
    setSelectedReportId,
    isReportModalOpen,
    setReportModalOpen,
  } = useUIStore();

  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<'reportedAt' | 'aiSeverity' | 'corridorId'>('reportedAt');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Severity override state inside modal
  const [overrideSeverity, setOverrideSeverity] = useState<Severity | ''>('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Queries
  const { data: corridors = [] } = useQuery({
    queryKey: ['corridors'],
    queryFn: railwayApi.getCorridors,
  });

  const { data: assets = [] } = useQuery({
    queryKey: ['assets'],
    queryFn: () => railwayApi.getAssets(),
  });

  const { data: reports = [], isLoading } = useQuery({
    queryKey: [
      'reports',
      {
        corridorId: activeCorridorFilter,
        severity: severityFilter,
        status: statusFilter,
        search: searchQuery,
      },
    ],
    queryFn: () =>
      railwayApi.getReports({
        corridorId: activeCorridorFilter,
        severity: severityFilter,
        status: statusFilter,
        search: searchQuery,
      }),
  });

  // Active report object
  const activeReport = reports.find((r) => r.id === selectedReportId) || (selectedReportId ? reports.find(r => r.id === selectedReportId) : null);
  const activeAsset = activeReport ? assets.find((a) => a.id === activeReport.assetId) : null;

  // Mutations
  const updateSeverityMutation = useMutation({
    mutationFn: ({ reportId, severity }: { reportId: string; severity: Severity }) =>
      railwayApi.updateReportSeverity(reportId, severity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      setActionSuccessMsg('Severity confirmed & saved to operational database.');
      setTimeout(() => setActionSuccessMsg(null), 3000);
    },
  });

  const convertToTaskMutation = useMutation({
    mutationFn: ({
      reportId,
      department,
      durationMinutes,
    }: {
      reportId: string;
      department: 'TRACK' | 'SIGNAL' | 'OHE';
      durationMinutes: number;
    }) => railwayApi.convertReportToTask(reportId, department, durationMinutes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['coordinationOpportunities'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      setActionSuccessMsg('Converted to Maintenance Task in Coordination Center!');
      setTimeout(() => setActionSuccessMsg(null), 3500);
    },
  });

  // Sorting
  const sortedReports = [...reports].sort((a, b) => {
    if (sortField === 'reportedAt') {
      const diff = new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
      return sortAsc ? -diff : diff;
    }
    if (sortField === 'corridorId') {
      return sortAsc
        ? a.corridorId.localeCompare(b.corridorId)
        : b.corridorId.localeCompare(a.corridorId);
    }
    if (sortField === 'aiSeverity') {
      const weight: Record<Severity, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      const diff = weight[b.aiSeverity] - weight[a.aiSeverity];
      return sortAsc ? -diff : diff;
    }
    return 0;
  });

  const handleRowClick = (report: ProblemReport) => {
    setSelectedReportId(report.id);
    setOverrideSeverity(report.confirmedSeverity || report.aiSeverity);
    setReportModalOpen(true);
  };

  const handleConfirmAiSeverity = () => {
    if (!activeReport) return;
    updateSeverityMutation.mutate({
      reportId: activeReport.id,
      severity: activeReport.aiSeverity,
    });
  };

  const handleSaveOverride = () => {
    if (!activeReport || !overrideSeverity) return;
    updateSeverityMutation.mutate({
      reportId: activeReport.id,
      severity: overrideSeverity as Severity,
    });
  };

  const handleConvertToTask = () => {
    if (!activeReport || !activeAsset) return;
    const duration = activeReport.aiSeverity === 'CRITICAL' ? 120 : 60;
    convertToTaskMutation.mutate({
      reportId: activeReport.id,
      department: activeAsset.type,
      durationMinutes: duration,
    });
  };

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h1 className="text-base sm:text-lg font-bold tracking-wider uppercase text-slate-100 font-mono flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-amber-400" />
            Live Field Defect Reports & Triage
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            INSPECTION TELEMETRY &bull; AI COMPUTER VISION SEVERITY SCORING &bull; SUPERVISOR OVERRIDE
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
          <span>MATCHING RECORDS:</span>
          <span className="bg-slate-900 px-2 py-1 border border-slate-700 text-amber-400 font-bold">
            {reports.length}
          </span>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <Card className="border-slate-800 bg-slate-950 p-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, keyword, or asset..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-3 bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 placeholder-slate-500 rounded-none focus:outline-none focus:border-slate-500"
            />
          </div>

          {/* Corridor Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400 shrink-0">CORRIDOR:</span>
            <select
              value={activeCorridorFilter}
              onChange={(e) => setActiveCorridorFilter(e.target.value)}
              className="w-full h-8 bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 px-2 rounded-none focus:outline-none focus:border-slate-500"
            >
              <option value="ALL">ALL CORRIDORS</option>
              {corridors.map((c) => (
                <option key={c.id} value={c.id}>
                  [{c.id}] {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400 shrink-0">SEVERITY:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full h-8 bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 px-2 rounded-none focus:outline-none focus:border-slate-500"
            >
              <option value="ALL">ALL SEVERITIES</option>
              <option value="CRITICAL">CRITICAL ONLY</option>
              <option value="HIGH">HIGH ONLY</option>
              <option value="MEDIUM">MEDIUM ONLY</option>
              <option value="LOW">LOW ONLY</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400 shrink-0">STATUS:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-8 bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 px-2 rounded-none focus:outline-none focus:border-slate-500"
            >
              <option value="ALL">ALL STATUSES</option>
              <option value="NEW">NEW (UNREVIEWED)</option>
              <option value="REVIEWED">REVIEWED</option>
              <option value="CONVERTED">CONVERTED TO TASK</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Reports Data Table */}
      <Card className="border-slate-800 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 border-b border-slate-800 text-[11px] uppercase font-mono text-slate-400">
                <tr>
                  <th
                    className="px-3 py-2.5 cursor-pointer hover:text-white"
                    onClick={() => {
                      setSortField('corridorId');
                      setSortAsc(!sortAsc);
                    }}
                  >
                    <div className="flex items-center gap-1">
                      Report ID <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-3 py-2.5">Corridor</th>
                  <th className="px-3 py-2.5">Asset ID & Type</th>
                  <th className="px-3 py-2.5">Defect Description</th>
                  <th
                    className="px-3 py-2.5 cursor-pointer hover:text-white"
                    onClick={() => {
                      setSortField('aiSeverity');
                      setSortAsc(!sortAsc);
                    }}
                  >
                    <div className="flex items-center gap-1">
                      AI Severity & Score <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-3 py-2.5">Confirmed Status</th>
                  <th
                    className="px-3 py-2.5 cursor-pointer hover:text-white"
                    onClick={() => {
                      setSortField('reportedAt');
                      setSortAsc(!sortAsc);
                    }}
                  >
                    <div className="flex items-center gap-1">
                      Reported (IST) <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-3 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-400 font-mono">
                      SYNCING LIVE DEFECT TELEMETRY...
                    </td>
                  </tr>
                ) : sortedReports.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-400 font-mono">
                      NO DEFECT REPORTS MATCHING CURRENT FILTER PARAMETERS.
                    </td>
                  </tr>
                ) : (
                  sortedReports.map((report) => {
                    const isSelected = selectedReportId === report.id;
                    const asset = assets.find((a) => a.id === report.assetId);

                    return (
                      <tr
                        key={report.id}
                        onClick={() => handleRowClick(report)}
                        className={`transition-colors cursor-pointer ${isSelected
                            ? 'bg-slate-800/80 border-l-2 border-l-blue-500'
                            : 'hover:bg-slate-800/40'
                          }`}
                      >
                        {/* ID */}
                        <td className="px-3 py-2.5 font-bold text-amber-400">
                          {report.id}
                        </td>

                        {/* Corridor */}
                        <td className="px-3 py-2.5 font-bold text-sky-400">
                          {report.corridorId}
                        </td>

                        {/* Asset */}
                        <td className="px-3 py-2.5">
                          <div className="flex flex-col">
                            <span className="text-slate-200">{report.assetId}</span>
                            <span className="text-[10px] text-slate-400 font-sans">
                              {asset?.type || 'TRACK'} &bull; {asset?.name.substring(0, 20)}...
                            </span>
                          </div>
                        </td>

                        {/* Description */}
                        <td className="px-3 py-2.5 max-w-sm">
                          <p className="font-sans text-xs text-slate-200 line-clamp-2">
                            {report.description}
                          </p>
                        </td>

                        {/* AI Severity */}
                        <td className="px-3 py-2.5">
                          <SeverityIndicator
                            severity={report.aiSeverity}
                            confidence={report.aiConfidence}
                            confirmedSeverity={report.confirmedSeverity}
                          />
                        </td>

                        {/* Status */}
                        <td className="px-3 py-2.5">
                          <StatusBadge status={report.status} className="text-[10px]" />
                        </td>

                        {/* Timestamp */}
                        <td className="px-3 py-2.5 text-slate-400 text-[11px]">
                          {formatDateTime(report.reportedAt)}
                        </td>

                        {/* Action */}
                        <td className="px-3 py-2.5 text-right">
                          <Button
                            variant="secondary"
                            size="xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowClick(report);
                            }}
                            className="font-mono text-[10px]"
                          >
                            Inspect &rarr;
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal / Panel */}
      <Dialog open={isReportModalOpen} onOpenChange={setReportModalOpen}>
        <DialogContent maxWidth="max-w-4xl" onClose={() => setReportModalOpen(false)}>
          {activeReport ? (
            <div className="space-y-4">
              {/* Header */}
              <DialogHeader>
                <div className="flex items-center justify-between gap-2">
                  <DialogTitle>
                    <span className="text-amber-400">{activeReport.id}</span>
                    <span className="text-slate-400 font-normal">| Defect Inspection Dossier</span>
                  </DialogTitle>
                  <StatusBadge status={activeReport.status} />
                </div>
                <div className="text-xs font-mono text-slate-400 flex items-center gap-3 mt-1">
                  <span>CORRIDOR: <strong className="text-sky-400">{activeReport.corridorId}</strong></span>
                  <span>ASSET: <strong className="text-slate-200">{activeReport.assetId}</strong></span>
                  <span>TIME: {formatDateTime(activeReport.reportedAt)}</span>
                </div>
              </DialogHeader>

              {/* Notification Banner */}
              {actionSuccessMsg && (
                <div className="bg-emerald-950/80 border border-emerald-700 p-2 text-xs font-mono text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{actionSuccessMsg}</span>
                </div>
              )}

              {/* Grid: Photo & Map + Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column: Defect Photo & GPS Pin */}
                <div className="space-y-3">
                  {/* Photo Container */}
                  <div className="border border-slate-700 bg-slate-950 relative overflow-hidden">
                    <div className="absolute top-2 left-2 z-10 bg-slate-950/90 border border-slate-700 px-2 py-0.5 text-[10px] font-mono text-slate-300">
                      OPTICAL CAPTURE &bull; AI HIGHLIGHT
                    </div>
                    <img
                      src={activeReport.photoUrl}
                      alt={`Defect ${activeReport.id}`}
                      className="w-full h-48 object-cover object-center brightness-95 contrast-105"
                      onError={(e) => {
                        // Fallback placeholder if offline
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                  </div>

                  {/* Leaflet GPS Map Pin */}
                  <div className="border border-slate-700 bg-slate-950 h-44 relative">
                    <div className="absolute top-2 left-2 z-[400] bg-slate-950/90 border border-slate-700 px-2 py-0.5 text-[10px] font-mono text-slate-300 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-red-400" />
                      GPS: {activeReport.gps.lat.toFixed(4)}° N, {activeReport.gps.lng.toFixed(4)}° E
                    </div>
                    <MapContainer
                      center={[activeReport.gps.lat, activeReport.gps.lng]}
                      zoom={14}
                      scrollWheelZoom={false}
                      style={{ height: '100%', width: '100%', backgroundColor: '#020617' }}
                    >
                      <TileLayer
                        attribution='&copy; CARTO'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                      />
                      <Marker
                        position={[activeReport.gps.lat, activeReport.gps.lng]}
                        icon={customPinIcon}
                      >
                        <Popup>
                          <div className="p-1 font-mono text-xs bg-slate-900 text-slate-100">
                            {activeReport.id} ({activeReport.corridorId})
                          </div>
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                </div>

                {/* Right Column: Defect Info & Severity Management */}
                <div className="space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    {/* Defect Description */}
                    <div className="border border-slate-800 bg-slate-950 p-3">
                      <div className="text-[10px] font-mono uppercase text-slate-400 mb-1">
                        Field Telemetry & Description
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-sans">
                        {activeReport.description}
                      </p>
                    </div>

                    {/* Asset Metadata */}
                    {activeAsset && (
                      <div className="border border-slate-800 bg-slate-950 p-3 font-mono text-xs space-y-1">
                        <div className="text-[10px] uppercase text-slate-400 mb-1">
                          Asset Registry Details
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>NAME:</span>
                          <span className="text-slate-100 font-bold">{activeAsset.name}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>DISCIPLINE:</span>
                          <span className="text-cyan-400 font-bold">{activeAsset.type}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>HEALTH STATUS:</span>
                          <StatusBadge status={activeAsset.status} showIcon={false} className="text-[9px] py-0" />
                        </div>
                      </div>
                    )}

                    {/* AI Severity Confidence Analysis */}
                    <div className="border border-slate-800 bg-slate-950 p-3 font-mono text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase text-slate-400">
                          AI Model Severity Analysis
                        </span>
                        <StatusBadge status={activeReport.aiSeverity} showIcon={false} />
                      </div>
                      <div className="flex items-center justify-between text-slate-300 text-xs">
                        <span>MODEL CONFIDENCE:</span>
                        <strong className="text-emerald-400">
                          {(activeReport.aiConfidence * 100).toFixed(1)}%
                        </strong>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 border border-slate-700">
                        <div
                          className="bg-emerald-500 h-full"
                          style={{ width: `${activeReport.aiConfidence * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Supervisor Action Box: Confirm / Override Severity */}
                  <div className="border border-slate-700 bg-slate-950 p-3 space-y-3">
                    <div className="text-[11px] font-mono font-bold uppercase text-slate-200 flex items-center gap-1.5">
                      <AlertOctagon className="h-3.5 w-3.5 text-amber-400" />
                      Supervisor Severity Confirmation & Override
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {/* Button 1: Instant Confirm AI */}
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleConfirmAiSeverity}
                        disabled={updateSeverityMutation.isPending}
                        className="w-full font-mono text-[11px] flex items-center gap-1 justify-center bg-slate-800 hover:bg-slate-700 text-emerald-400 border-emerald-800"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Confirm AI ({activeReport.aiSeverity})
                      </Button>

                      {/* Button 2: Override Dropdown & Submit */}
                      <div className="flex gap-1">
                        <select
                          value={overrideSeverity}
                          onChange={(e) => setOverrideSeverity(e.target.value as Severity)}
                          className="h-7 flex-1 bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 px-1.5 focus:outline-none"
                        >
                          <option value="CRITICAL">CRITICAL</option>
                          <option value="HIGH">HIGH</option>
                          <option value="MEDIUM">MEDIUM</option>
                          <option value="LOW">LOW</option>
                        </select>
                        <Button
                          variant="secondary"
                          size="xs"
                          onClick={handleSaveOverride}
                          disabled={updateSeverityMutation.isPending}
                          className="font-mono text-[10px]"
                        >
                          Override
                        </Button>
                      </div>
                    </div>

                    {/* Convert to Task action */}
                    {activeReport.status !== 'CONVERTED' ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleConvertToTask}
                        disabled={convertToTaskMutation.isPending}
                        className="w-full font-mono text-[11px] flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white"
                      >
                        <Layers className="h-3.5 w-3.5" />
                        Generate Maintenance Task &rarr; Coordination Center
                      </Button>
                    ) : (
                      <div className="text-center font-mono text-[11px] text-purple-400 bg-purple-950/50 border border-purple-800 py-1.5 flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Maintenance Task Generated in Coordination Center
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
