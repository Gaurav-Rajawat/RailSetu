import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { railwayApi } from '@/services/api';
import { useUIStore } from '@/store/uiStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import {
  Search,
  Users,
} from 'lucide-react';

export function WorkOrdersPage() {
  const { activeCorridorFilter, setSelectedWorkOrder } = useUIStore();
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const { data: workOrders = [] } = useQuery({
    queryKey: ['workOrders', { corridorId: activeCorridorFilter, department: deptFilter, status: statusFilter, search: searchTerm }],
    queryFn: () =>
      railwayApi.getWorkOrders({
        corridorId: activeCorridorFilter,
        department: deptFilter,
        status: statusFilter,
        search: searchTerm,
      }),
  });

  return (
    <div className="space-y-4 max-w-[1680px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3.5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-base sm:text-lg font-black tracking-wider uppercase text-slate-900 dark:text-slate-100 font-mono">
              Work Order Dispatch & Field Maintenance Management
            </h1>
            <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded font-mono font-bold border border-blue-200 dark:border-blue-800">
              DISPATCH CONTROL
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
            Track, Signal & OHE work package coordination, progress tracking, and contractor/gang allocations
          </p>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-[#111827] rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Search */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 text-xs flex-1 min-w-[240px] max-w-md">
          <Search className="h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Work Order ID, Asset, Issue Type, or Crew..."
            className="bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none w-full"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-2">
          {/* Department Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-0.5 rounded border border-slate-200 dark:border-slate-800 text-xs font-mono">
            {['ALL', 'TRACK', 'SIGNAL', 'OHE'].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDeptFilter(d)}
                className={`px-2.5 py-1 rounded font-bold transition-all ${deptFilter === d
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-0.5 rounded border border-slate-200 dark:border-slate-800 text-xs font-mono">
            {['ALL', 'IN_PROGRESS', 'DISPATCHED', 'COMPLETED'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 rounded font-bold transition-all ${statusFilter === s
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Work Orders Table */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-slate-900 dark:text-slate-100">
            Active Work Orders Registry ({workOrders.length})
          </CardTitle>
          <CardDescription>
            Live maintenance packages assigned to zonal engineers and rapid gangs
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-950/80 border-y border-slate-200 dark:border-slate-800 text-[10px] uppercase font-mono text-slate-500 dark:text-slate-400 font-bold select-none">
                <tr>
                  <th className="px-4 py-2.5">Work Order ID</th>
                  <th className="px-4 py-2.5">Asset / Sector</th>
                  <th className="px-4 py-2.5">Issue Description</th>
                  <th className="px-4 py-2.5">Priority</th>
                  <th className="px-4 py-2.5">Assigned Gang</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Progress</th>
                  <th className="px-4 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {workOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 font-mono">
                      No matching work orders found.
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
    </div>
  );
}
