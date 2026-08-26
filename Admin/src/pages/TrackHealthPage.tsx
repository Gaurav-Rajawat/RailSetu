import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { railwayApi } from '@/services/api';
import { useUIStore } from '@/store/uiStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/StatusBadge';
import {
  Gauge,
  Layers,
  ShieldCheck,
  Search,
} from 'lucide-react';

export function TrackHealthPage() {
  const { activeCorridorFilter } = useUIStore();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: assets = [] } = useQuery({
    queryKey: ['assets', { corridorId: activeCorridorFilter }],
    queryFn: () => railwayApi.getAssets(activeCorridorFilter),
  });

  const trackAssets = assets.filter((a) => a.type === 'TRACK');

  const filteredAssets = searchTerm
    ? trackAssets.filter(
      (a) =>
        a.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : trackAssets;

  return (
    <div className="space-y-4 max-w-[1680px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3.5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-base sm:text-lg font-black tracking-wider uppercase text-slate-900 dark:text-slate-100 font-mono">
              Track Health & Ultrasonic Geometry Diagnostics
            </h1>
            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded font-mono font-bold border border-emerald-200 dark:border-emerald-800">
              P-WAY INTEGRITY
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
            Continuous rail stress analysis, fishplate joint torques, sleeper integrity, and ultrasonic car passes
          </p>
        </div>
      </div>

      {/* Track Health Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-800 dark:text-slate-200">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Continuous Rail Geometry Index
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-mono font-black text-emerald-600 dark:text-emerald-400">
              96.8 / 100
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
              Complies with RDSO high-speed stability standard
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-800 dark:text-slate-200">
              <Gauge className="h-4 w-4 text-blue-500" />
              Peak Section Dynamic Stress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-mono font-black text-slate-900 dark:text-slate-100">
              0.88 MPa
            </div>
            <div className="text-xs text-amber-600 dark:text-amber-400 font-mono mt-1 font-semibold">
              Corridor C04 (Mumbai–Surat) near upper stress limit
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-800 dark:text-slate-200">
              <Layers className="h-4 w-4 text-indigo-500" />
              Track Segments Inspected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-mono font-black text-slate-900 dark:text-slate-100">
              {trackAssets.length} Sectors
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
              Active Ultrasonic Rail Flaw Detection (USFD)
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Asset Table */}
      <Card>
        <CardHeader className="py-3 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-slate-900 dark:text-slate-100">
              P-Way Asset Health Registry
            </CardTitle>
            <CardDescription>
              Detailed structural health telemetry for track rails, switches, crossings, and ballast
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 text-xs">
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter track asset ID or section..."
              className="bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none w-48 sm:w-60"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-950/80 border-y border-slate-200 dark:border-slate-800 text-[10px] uppercase font-mono text-slate-500 dark:text-slate-400 font-bold select-none">
                <tr>
                  <th className="px-4 py-2.5">Asset ID</th>
                  <th className="px-4 py-2.5">Corridor Sector</th>
                  <th className="px-4 py-2.5">Asset Description</th>
                  <th className="px-4 py-2.5">Health Status</th>
                  <th className="px-4 py-2.5">Last USFD Pass</th>
                  <th className="px-4 py-2.5">Next Tamping Slot</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {filteredAssets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-mono">
                      No track assets found.
                    </td>
                  </tr>
                ) : (
                  filteredAssets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-bold text-blue-600 dark:text-blue-400">
                        {asset.id}
                      </td>
                      <td className="px-4 py-3 text-sky-600 dark:text-sky-400 font-bold">
                        {asset.corridorId}
                      </td>
                      <td className="px-4 py-3 text-slate-800 dark:text-slate-200 font-sans text-xs">
                        {asset.name}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={asset.status} showIcon={false} className="text-[10px]" />
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-[11px]">
                        2026-08-22 (3 days ago)
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-[11px]">
                        2026-08-28 (Scheduled)
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
