
import { useQuery } from '@tanstack/react-query';
import { railwayApi } from '@/services/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DepartmentBadge } from '@/components/common/DepartmentBadge';

import {
  Users,
  Truck,
  MapPin,
  Phone,
  CheckCircle2,

} from 'lucide-react';

export function CrewDispatchPage() {
  const { data: crews = [] } = useQuery({
    queryKey: ['crews'],
    queryFn: railwayApi.getCrewTeams,
  });

  const availableCount = crews.filter((c) => c.status === 'AVAILABLE').length;
  const dispatchedCount = crews.filter((c) => c.status === 'DISPATCHED').length;

  return (
    <div className="space-y-4 max-w-[1680px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3.5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-base sm:text-lg font-black tracking-wider uppercase text-slate-900 dark:text-slate-100 font-mono">
              Crew Dispatch & Mobile Maintenance Gangs
            </h1>
            <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded font-mono font-bold border border-blue-200 dark:border-blue-800">
              FIELD RESOURCE MANAGEMENT
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
            Real-time GPS tracking of P-Way gangs, OHE tower wagon squads, and S&T rapid responders
          </p>
        </div>
      </div>

      {/* Overview Metric Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-800 dark:text-slate-200">
              <Users className="h-4 w-4 text-blue-500" />
              Total Registered Crews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-mono font-black text-slate-900 dark:text-slate-100">
              {crews.length} Teams
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
              Track, Signal & OHE divisions
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-800 dark:text-slate-200">
              <Truck className="h-4 w-4 text-indigo-500" />
              Currently Dispatched
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-mono font-black text-indigo-600 dark:text-indigo-400">
              {dispatchedCount} Teams
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
              Active on field work orders
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-800 dark:text-slate-200">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Available on Standby
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-mono font-black text-emerald-600 dark:text-emerald-400">
              {availableCount} Teams
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
              Ready for immediate mobilization
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Crew Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {crews.map((crew) => (
          <Card key={crew.id} className="flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            <CardHeader className="py-3 px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                    {crew.id}
                  </span>
                  <DepartmentBadge department={crew.department} showIcon={false} className="text-[9px]" />
                </div>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${crew.status === 'DISPATCHED'
                    ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                    : 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    }`}
                >
                  {crew.status}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
                {crew.name}
              </h4>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Team Leader:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{crew.leadName}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Gang Strength:</span>
                <span className="text-slate-800 dark:text-slate-200">{crew.membersCount} Crew Members</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
                <span className="truncate">{crew.currentLocation}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <Phone className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>{crew.contactNumber}</span>
              </div>

              {crew.activeWorkOrderId && (
                <div className="mt-2 p-2 rounded bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-between">
                  <span className="text-[11px] text-blue-700 dark:text-blue-300 font-bold">
                    Active: {crew.activeWorkOrderId}
                  </span>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400">
                    ETA: {crew.etaMinutes} min
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
