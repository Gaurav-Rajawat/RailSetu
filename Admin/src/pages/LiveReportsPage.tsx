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
    selectedReportId,
    setSelectedReportId,
    isReportModalOpen,
    setReportModalOpen,
  } = useUIStore();

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

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
        category: categoryFilter,
        severity: severityFilter,
        status: statusFilter,
        search: searchQuery,
      },
    ],
    queryFn: () =>
      railwayApi.getReports({
        category: categoryFilter,
        severity: severityFilter,
        status: statusFilter,
        search: searchQuery,
      }),
  });

  // Active report object
  const activeReport = reports.find((r) => r.id === selectedReportId) || (selectedReportId ? reports.find(r => r.id === selectedReportId) : null);
  const activeAsset = activeReport ? assets.find((a) => a.id === 'MOCK_ASSET') : null; // Using mock asset since real backend doesn't provide it yet

  // Mutations
  const updateReportMutation = useMutation({
    mutationFn: ({ reportId, severity, status }: { reportId: string; severity?: string; status?: string }) =>
      railwayApi.updateReport(reportId, { severity, status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      setActionSuccessMsg('Update saved to operational database.');
      setTimeout(() => setActionSuccessMsg(null), 3000);
    },
  });

  const [overrideStatus, setOverrideStatus] = useState<string>('');

  // Sorting
  const sortedReports = [...reports].sort((a, b) => {
    if (sortField === 'reportedAt') {
      const diff = new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
      return sortAsc ? -diff : diff;
    }
    if (sortField === 'corridorId') {
      return sortAsc
        ? a.category.localeCompare(b.category)
        : b.category.localeCompare(a.category);
    }
    if (sortField === 'aiSeverity') {
      const weight: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1, UNKNOWN: 0 };
      const diff = (weight[b.aiSeverity] || 0) - (weight[a.aiSeverity] || 0);
      return sortAsc ? -diff : diff;
    }
    return 0;
  });

  const handleRowClick = (report: ProblemReport) => {
    setSelectedReportId(report.id);
    setOverrideSeverity(report.confirmedSeverity || report.aiSeverity);
    setOverrideStatus(report.status);
    setReportModalOpen(true);
  };

  const handleConfirmAiSeverity = () => {
    if (!activeReport) return;
    updateReportMutation.mutate({
      reportId: activeReport.id,
      severity: activeReport.aiSeverity,
    });
  };

  const handleSaveOverride = () => {
    if (!activeReport || (!overrideSeverity && !overrideStatus)) return;
    updateReportMutation.mutate({
      reportId: activeReport.id,
      severity: overrideSeverity || undefined,
      status: overrideStatus || undefined,
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

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400 shrink-0">CATEGORY:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full h-8 bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 px-2 rounded-none focus:outline-none focus:border-slate-500"
            >
              <option value="ALL">ALL CATEGORIES</option>
              <option value="TRACK">TRACK</option>
              <option value="SIGNAL">SIGNAL</option>
              <option value="TRACTION_OHE">TRACTION OHE</option>
              <option value="OTHER">OTHER</option>
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
              <option value="PENDING">PENDING (UNREVIEWED)</option>
              <option value="INVESTIGATING">INVESTIGATING</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="DISMISSED">DISMISSED</option>
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
                  <th className="px-3 py-2.5">Category</th>
                  <th className="px-3 py-2.5">Reporter ID</th>
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

                        {/* Category */}
                        <td className="px-3 py-2.5 font-bold text-sky-400">
                          {report.category}
                        </td>

                        {/* Reporter ID */}
                        <td className="px-3 py-2.5">
                          <div className="flex flex-col">
                            <span className="text-slate-200">{report.reporterId || 'Anonymous'}</span>
                            <span className="text-[10px] text-slate-400 font-sans">
                              Field Worker
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
                  <span>CATEGORY: <strong className="text-sky-400">{activeReport.category}</strong></span>
                  <span>REPORTER: <strong className="text-slate-200">{activeReport.reporterId || 'Anonymous'}</strong></span>
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
                    {activeReport.photoUrl ? (
                      <div className="flex overflow-x-auto snap-x snap-mandatory w-full h-48 pb-1 gap-1">
                        {activeReport.photoUrl.split(',').map((url, idx, arr) => (
                          <div key={idx} className={`${arr.length > 1 ? 'w-[90%]' : 'w-full'} h-full flex-shrink-0 snap-center relative`}>
                            <img
                              src={url.trim()}
                              alt={`Defect ${activeReport.id} - ${idx + 1}`}
                              className="w-full h-full object-cover object-center brightness-95 contrast-105"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=800&q=80';
                              }}
                            />
                            {arr.length > 1 && (
                               <div className="absolute bottom-1 right-1 bg-black/60 text-[10px] text-white px-1.5 py-0.5 rounded font-mono">
                                 {idx + 1} / {arr.length}
                               </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center text-slate-600 font-mono text-xs bg-slate-900">
                        NO PHOTO
                      </div>
                    )}
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
                            {activeReport.id} ({activeReport.category})
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
                      <p className="text-xs text-slate-200 leading-relaxed font-sans break-all whitespace-pre-wrap max-h-32 overflow-y-auto custom-scrollbar">
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
                          <span className="text-slate-100 font-bold break-all">{activeAsset.name}</span>
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
                      <AlertOctagon className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      Supervisor Confirmation
                    </div>

                    <div className="flex flex-col gap-2">
                      {/* Button 1: Instant Confirm AI */}
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleConfirmAiSeverity}
                        disabled={updateReportMutation.isPending}
                        className="w-full font-mono text-[11px] flex items-center gap-1 justify-center bg-slate-800 hover:bg-slate-700 text-emerald-400 border-emerald-800"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">Confirm Current ({activeReport.aiSeverity})</span>
                      </Button>

                      {/* Button 2: Override Dropdown & Submit */}
                      <div className="flex gap-1 w-full">
                        <select
                          value={overrideSeverity}
                          onChange={(e) => setOverrideSeverity(e.target.value as Severity)}
                          className="h-8 flex-1 bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 px-1.5 focus:outline-none min-w-0"
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
                          disabled={updateReportMutation.isPending}
                          className="font-mono text-[10px]"
                        >
                          Save
                        </Button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                      <div className="text-[11px] font-mono uppercase text-slate-400 mb-2">
                        Update Report Status
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={overrideStatus}
                          onChange={(e) => setOverrideStatus(e.target.value)}
                          className="h-7 flex-1 bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 px-1.5 focus:outline-none"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="INVESTIGATING">INVESTIGATING</option>
                          <option value="RESOLVED">RESOLVED</option>
                          <option value="DISMISSED">DISMISSED</option>
                        </select>
                        <Button
                          variant="primary"
                          size="xs"
                          onClick={handleSaveOverride}
                          disabled={updateReportMutation.isPending}
                          className="font-mono text-[10px] flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Update
                        </Button>
                      </div>
                    </div>
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
