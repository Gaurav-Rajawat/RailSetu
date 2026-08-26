import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { railwayApi } from '@/services/api';
import { useUIStore } from '@/store/uiStore';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { RailwayMap } from '@/components/map/RailwayMap';
import { RadialGauge } from '@/components/common/RadialGauge';
import { Sparkline } from '@/components/common/Sparkline';
import { formatDateTime } from '@/lib/utils';
import {
  ShieldAlert,
  Activity,
  TrendingUp,
  TrendingDown,
  Wrench,
  Truck,
  Users,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from 'recharts';

export function OverviewPage() {
  const navigate = useNavigate();
  const {
    activeCorridorFilter,
    setSelectedReportId,
    setSelectedAlertForDispatch,
    setSelectedWorkOrder,
    theme,
  } = useUIStore();

  const [woDeptFilter, setWoDeptFilter] = useState<string>('ALL');
  const [telemetryRange, setTelemetryRange] = useState<'24H' | '12H' | '6H'>('24H');

  // Queries
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: railwayApi.getDashboardStats,
  });

  const { data: corridors = [], isLoading: isCorridorsLoading } = useQuery({
    queryKey: ['corridors'],
    queryFn: railwayApi.getCorridors,
  });

  const { data: reports = [], isLoading: isReportsLoading } = useQuery({
    queryKey: ['reports', { corridorId: activeCorridorFilter }],
    queryFn: () => railwayApi.getReports({ corridorId: activeCorridorFilter }),
  });

  const { data: workOrders = [], isLoading: isWOsLoading } = useQuery({
    queryKey: ['workOrders', { corridorId: activeCorridorFilter, department: woDeptFilter }],
    queryFn: () =>
      railwayApi.getWorkOrders({
        corridorId: activeCorridorFilter,
        department: woDeptFilter,
      }),
  });

  const { data: componentWear } = useQuery({
    queryKey: ['componentWear'],
    queryFn: railwayApi.getComponentWear,
  });

  const { data: vibrationSeries = [] } = useQuery({
    queryKey: ['vibrationSeries'],
    queryFn: railwayApi.getVibrationSeries,
  });

  const recentAlerts = reports.slice(0, 5);

  // Sparkline mock trend data
  const woTrendData = [12, 14, 13, 16, 15, 17, 18];
  const critTrendData = [7, 6, 5, 6, 4, 4, 3];
  const fleetTrendData = [97.8, 98.0, 98.1, 98.2, 98.3, 98.4, 98.4];
  const resTrendData = [91.0, 92.4, 93.1, 93.8, 94.0, 94.2, 94.2];

  // Chart theme configurations
  const isDark = theme === 'dark';
  const gridColor = isDark ? '#1F2937' : '#E2E8F0';
  const textColor = isDark ? '#94A3B8' : '#64748B';
  const tooltipBg = isDark ? '#111827' : '#FFFFFF';
  const tooltipBorder = isDark ? '#374151' : '#E2E8F0';

  return (
    <div className="space-y-4 max-w-[1680px] mx-auto">
      {/* Page Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3.5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-base sm:text-lg font-black tracking-wider uppercase text-slate-900 dark:text-slate-100 font-mono">
              Operational Command Overview
            </h1>
            <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded font-mono font-bold border border-blue-200 dark:border-blue-800">
              REAL-TIME TELEMETRY
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
            ZONAL SCADA &bull; PREDICTIVE TRACK DEFECT TRIAGE &bull; GANG DISPATCH COORDINATION
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-500 dark:text-slate-400">ACTIVE CONTEXT:</span>
          <span className="text-blue-600 dark:text-sky-400 font-bold bg-white dark:bg-slate-900 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-800 shadow-sm">
            {activeCorridorFilter === 'ALL' ? 'NATIONAL RAIL NETWORK' : `CORRIDOR ${activeCorridorFilter}`}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ROW 1: 4 KPI METRIC CARDS WITH SPARKLINES, DELTAS & STATUS TAGS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Active Work Orders */}
        <Card className="relative overflow-hidden hover:border-blue-300 dark:hover:border-blue-700 transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-800 dark:text-slate-200">
                <Wrench className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Active Work Orders
              </CardTitle>
              <span className="text-[10px] font-mono font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                FIELD ACTIVE
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline justify-between">
              <div className="text-2xl sm:text-3xl font-mono font-black text-slate-900 dark:text-slate-100">
                {isStatsLoading ? '--' : stats?.activeWorkOrdersCount || 8}
              </div>
              <Sparkline data={woTrendData} color="#2563EB" fillColor="rgba(37, 99, 235, 0.12)" />
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
              <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-mono font-semibold text-[11px]">
                <TrendingUp className="h-3 w-3 mr-0.5" />
                +3 Dispatched Today
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                6 In Progress &bull; 2 In Route
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Critical Faults */}
        <Card className="relative overflow-hidden hover:border-red-300 dark:hover:border-red-700 transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-red-600" />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-red-700 dark:text-red-400">
                <ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-400" />
                Critical Faults
              </CardTitle>
              <span className="text-[10px] font-mono font-bold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/80 px-1.5 py-0.5 rounded border border-red-200 dark:border-red-800 animate-pulse">
                ACTION REQ
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline justify-between">
              <div className="text-2xl sm:text-3xl font-mono font-black text-red-600 dark:text-red-400">
                {isStatsLoading ? '--' : stats?.criticalReportsOpen}
              </div>
              <Sparkline data={critTrendData} color="#EF4444" fillColor="rgba(239, 68, 68, 0.12)" />
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
              <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-mono font-semibold text-[11px]">
                <TrendingDown className="h-3 w-3 mr-0.5" />
                -2 Resolved (24h)
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                AI Confidence &ge; 90%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Fleet Health Index */}
        <Card className="relative overflow-hidden hover:border-emerald-300 dark:hover:border-emerald-700 transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-emerald-700 dark:text-emerald-400">
                <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Fleet Health Index
              </CardTitle>
              <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                TARGET 98.0%
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline justify-between">
              <div className="text-2xl sm:text-3xl font-mono font-black text-slate-900 dark:text-slate-100">
                {isStatsLoading ? '--' : `${stats?.fleetHealthIndex || 98.4}%`}
              </div>
              <Sparkline data={fleetTrendData} color="#10B981" fillColor="rgba(16, 185, 129, 0.12)" />
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
              <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-mono font-semibold text-[11px]">
                <TrendingUp className="h-3 w-3 mr-0.5" />
                +0.4% vs Target
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                142 Rolling Stock Units
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Resolution Rate (MTTR) */}
        <Card className="relative overflow-hidden hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500" />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-indigo-700 dark:text-indigo-400">
                <CheckCircle2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                Resolution Rate / MTTR
              </CardTitle>
              <span className="text-[10px] font-mono font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                SLA 90.0%
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline justify-between">
              <div className="text-2xl sm:text-3xl font-mono font-black text-slate-900 dark:text-slate-100">
                {isStatsLoading ? '--' : `${stats?.resolutionRate || 94.2}%`}
              </div>
              <Sparkline data={resTrendData} color="#6366F1" fillColor="rgba(99, 102, 241, 0.12)" />
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
              <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-mono font-semibold text-[11px]">
                <Clock className="h-3 w-3 mr-0.5" />
                Avg MTTR: 42 Min
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                98.6% SLA Compliant
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* ROW 2: MAP (65% WIDTH) & REAL-TIME ALERT FEED (35% WIDTH) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Left: Geospatial Rail Track Map (65% = 8 cols) */}
        <div className="lg:col-span-8 flex flex-col">
          <Card className="flex flex-col h-full">
            <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-slate-900 dark:text-slate-100">
                  National Rail Corridor GIS Telemetry & Track Integrity
                </CardTitle>
                <CardDescription>
                  Vector track stress index, dynamic health pulse, and GPS defect markers
                </CardDescription>
              </div>

              {/* Status legend */}
              <div className="flex items-center gap-3 font-mono text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  <span className="text-slate-600 dark:text-slate-400">HEALTHY</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  <span className="text-slate-600 dark:text-slate-400">WARN</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block animate-pulse" />
                  <span className="text-slate-600 dark:text-slate-400">CRITICAL</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 min-h-[380px]">
              {isCorridorsLoading || isReportsLoading ? (
                <div className="h-[380px] flex items-center justify-center font-mono text-xs text-slate-400 bg-slate-100 dark:bg-slate-950">
                  CONNECTING TO GEOSPATIAL VECTOR MAP SERVICE...
                </div>
              ) : (
                <RailwayMap
                  corridors={corridors}
                  reports={reports}
                  activeCorridorId={activeCorridorFilter}
                  height="380px"
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Real-Time Alert Feed Stream (35% = 4 cols) */}
        <div className="lg:col-span-4 flex flex-col">
          <Card className="flex flex-col h-full">
            <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
                <CardTitle className="text-slate-900 dark:text-slate-100">
                  Real-Time Alert Feed
                </CardTitle>
              </div>
              <button
                type="button"
                onClick={() => navigate('/reports')}
                className="text-xs font-mono text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                VIEW ALL ({reports.length}) &rarr;
              </button>
            </CardHeader>
            <CardContent className="p-3 flex-1 flex flex-col justify-between overflow-y-auto max-h-[380px] space-y-2.5">
              {recentAlerts.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 font-mono">
                  No active alerts in current sector context.
                </div>
              ) : (
                recentAlerts.map((alert) => {
                  const sev = alert.confirmedSeverity || alert.aiSeverity;
                  const borderColor =
                    sev === 'CRITICAL'
                      ? 'border-l-red-500'
                      : sev === 'HIGH'
                        ? 'border-l-orange-500'
                        : 'border-l-amber-500';

                  return (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-md bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 border-l-4 ${borderColor} transition-all hover:bg-slate-100 dark:hover:bg-slate-800/60 flex flex-col justify-between gap-2`}
                    >
                      <div
                        className="flex items-start justify-between gap-2 cursor-pointer"
                        onClick={() => {
                          setSelectedReportId(alert.id);
                          navigate('/reports');
                        }}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100 hover:underline">
                              {alert.id}
                            </span>
                            <span className="text-[10px] font-mono text-sky-600 dark:text-sky-400 font-semibold">
                              [{alert.corridorId}]
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300 font-sans line-clamp-2 mt-0.5 leading-snug">
                            {alert.description}
                          </p>
                        </div>
                        <StatusBadge status={sev} showIcon={false} className="text-[9px] py-0 px-1 shrink-0" />
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/80 dark:border-slate-800 text-[11px] font-mono">
                        <span className="text-slate-500 dark:text-slate-400">
                          {formatDateTime(alert.reportedAt)}
                        </span>
                        <Button
                          size="xs"
                          variant="primary"
                          onClick={() => setSelectedAlertForDispatch(alert)}
                          className="gap-1 font-mono text-[10px]"
                        >
                          <Truck className="h-3 w-3" />
                          Dispatch Crew
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ROW 3: WORK ORDER MANAGEMENT GRID (DATA TABLE) */}
      {/* ========================================================================= */}
      <Card>
        <CardHeader className="py-3 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-slate-900 dark:text-slate-100">
                Work Order Management Grid
              </CardTitle>
              <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded font-bold">
                {workOrders.length} DISPATCH PACKAGES
              </span>
            </div>
            <CardDescription>
              Coordinated field maintenance assignments across Track, Signal & OHE divisions
            </CardDescription>
          </div>

          {/* Department Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-md border border-slate-200 dark:border-slate-800 text-xs font-mono">
            {['ALL', 'TRACK', 'SIGNAL', 'OHE'].map((dept) => (
              <button
                key={dept}
                type="button"
                onClick={() => setWoDeptFilter(dept)}
                className={`px-2.5 py-1 rounded font-bold transition-all ${woDeptFilter === dept
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-950/80 border-y border-slate-200 dark:border-slate-800 text-[10px] uppercase font-mono text-slate-500 dark:text-slate-400 font-bold select-none">
                <tr>
                  <th className="px-4 py-2.5">Work Order ID</th>
                  <th className="px-4 py-2.5">Asset / Track</th>
                  <th className="px-4 py-2.5">Issue Type & Plan</th>
                  <th className="px-4 py-2.5">Priority</th>
                  <th className="px-4 py-2.5">Assigned Crew</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Progress</th>
                  <th className="px-4 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {isWOsLoading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 font-mono">
                      CONNECTING TO DISPATCH PACKAGES REGISTRY...
                    </td>
                  </tr>
                ) : workOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 font-mono">
                      No active work orders for selected filter.
                    </td>
                  </tr>
                ) : (
                  workOrders.map((wo) => (
                    <tr
                      key={wo.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                      onClick={() => setSelectedWorkOrder(wo)}
                    >
                      <td className="px-4 py-3 font-bold text-blue-600 dark:text-blue-400">
                        {wo.id}
                      </td>
                      <td className="px-4 py-3 text-slate-800 dark:text-slate-200">
                        <span className="bg-slate-100 dark:bg-slate-800/80 px-1.5 py-0.5 rounded text-[11px] border border-slate-200 dark:border-slate-700">
                          {wo.assetTrack}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-800 dark:text-slate-200 font-sans text-xs max-w-sm">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{wo.issueType}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{wo.actionRequired}</div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={wo.priority} showIcon={false} className="text-[10px]" />
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-sans text-xs">
                        <span className="flex items-center gap-1.5">
                          <Users className="h-3 w-3 text-slate-400" />
                          {wo.assignedCrew}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={wo.status} showIcon={false} className="text-[10px]" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full"
                              style={{ width: `${wo.progressPercent}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-500">{wo.progressPercent}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedWorkOrder(wo);
                          }}
                          className="text-[10px] font-mono uppercase"
                        >
                          Inspect &rarr;
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* ROW 4: PREDICTIVE TELEMETRY (RADIAL GAUGES & TIME-SERIES GRADIENT CHART) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Left: Radial Gauges for Component Wear (40% = 5 cols) */}
        <div className="lg:col-span-5 flex flex-col">
          <Card className="flex flex-col h-full">
            <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-slate-900 dark:text-slate-100">
                  Rolling Stock Wear Gauges
                </CardTitle>
                <CardDescription>
                  Real-time sensor telemetry on brake pads, wheel flange & pantograph
                </CardDescription>
              </div>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-bold">
                142 UNITS MONITORED
              </span>
            </CardHeader>
            <CardContent className="p-3.5 flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <RadialGauge
                label="Brake Pads"
                value={componentWear?.brakePadsWear || 74}
                kmRemaining={componentWear?.brakePadKmRemaining || 12400}
                warnThreshold={65}
                critThreshold={80}
              />
              <RadialGauge
                label="Wheel Profile"
                value={componentWear?.wheelProfileWear || 58}
                kmRemaining={componentWear?.wheelProfileKmRemaining || 34200}
                warnThreshold={65}
                critThreshold={80}
              />
              <RadialGauge
                label="Pantograph"
                value={componentWear?.pantographStripWear || 82}
                kmRemaining={componentWear?.pantographKmRemaining || 4800}
                warnThreshold={65}
                critThreshold={80}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right: Gradient Time-Series Chart for Track Vibration & Stress (60% = 7 cols) */}
        <div className="lg:col-span-7 flex flex-col">
          <Card className="flex flex-col h-full">
            <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-slate-900 dark:text-slate-100">
                  Track Dynamic Vibration & Stress Telemetry
                </CardTitle>
                <CardDescription>
                  24-Hour continuous sensor monitoring: Peak g-force & acoustic frequencies
                </CardDescription>
              </div>

              {/* Range controls */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-0.5 rounded border border-slate-200 dark:border-slate-800 text-[10px] font-mono">
                {(['6H', '12H', '24H'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setTelemetryRange(r)}
                    className={`px-2 py-0.5 rounded font-bold transition-all ${telemetryRange === r
                        ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-3.5 flex-1 min-h-[220px]">
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={vibrationSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="vibrationGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis
                      dataKey="time"
                      stroke={textColor}
                      tick={{ fontSize: 10, fontFamily: 'monospace' }}
                    />
                    <YAxis
                      stroke={textColor}
                      tick={{ fontSize: 10, fontFamily: 'monospace' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: tooltipBg,
                        borderColor: tooltipBorder,
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                        color: isDark ? '#F8FAFC' : '#0F172A',
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '6px' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="trackVibration"
                      name="Track Vibration (g-peak)"
                      stroke="#2563EB"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#vibrationGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="acousticAnomaly"
                      name="Acoustic Defect Index (dB)"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#stressGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
