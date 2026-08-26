import { useState, useEffect } from 'react';
import { useUIStore } from '@/store/uiStore';
import { useQuery } from '@tanstack/react-query';
import { railwayApi } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { StatusBadge } from '@/components/common/StatusBadge';
import {
  Search,
  Train,
  Wrench,
  FileWarning,
  ArrowRight,
} from 'lucide-react';

export function GlobalSearchModal() {
  const { isGlobalSearchOpen, setGlobalSearchOpen, setSelectedReportId, setSelectedWorkOrder } = useUIStore();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Listen for Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setGlobalSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setGlobalSearchOpen]);

  const { data: reports = [] } = useQuery({
    queryKey: ['reports'],
    queryFn: () => railwayApi.getReports(),
    enabled: isGlobalSearchOpen,
  });

  const { data: workOrders = [] } = useQuery({
    queryKey: ['workOrders'],
    queryFn: () => railwayApi.getWorkOrders(),
    enabled: isGlobalSearchOpen,
  });

  const { data: corridors = [] } = useQuery({
    queryKey: ['corridors'],
    queryFn: railwayApi.getCorridors,
    enabled: isGlobalSearchOpen,
  });

  const q = searchTerm.toLowerCase().trim();

  const filteredReports = q
    ? reports.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.assetId.toLowerCase().includes(q) ||
          r.corridorId.toLowerCase().includes(q)
      ).slice(0, 4)
    : reports.slice(0, 3);

  const filteredWOs = q
    ? workOrders.filter(
        (w) =>
          w.id.toLowerCase().includes(q) ||
          w.issueType.toLowerCase().includes(q) ||
          w.assetTrack.toLowerCase().includes(q) ||
          w.assignedCrew.toLowerCase().includes(q)
      ).slice(0, 4)
    : workOrders.slice(0, 3);

  const filteredCorridors = q
    ? corridors.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.section.toLowerCase().includes(q)
      )
    : corridors.slice(0, 3);

  const handleSelectReport = (id: string) => {
    setSelectedReportId(id);
    setGlobalSearchOpen(false);
    navigate('/reports');
  };

  const handleSelectWO = (wo: any) => {
    setSelectedWorkOrder(wo);
    setGlobalSearchOpen(false);
    navigate('/');
  };

  const handleSelectCorridor = (corridorId: string) => {
    useUIStore.getState().setActiveCorridorFilter(corridorId);
    setGlobalSearchOpen(false);
    navigate('/');
  };

  return (
    <Dialog open={isGlobalSearchOpen} onOpenChange={setGlobalSearchOpen}>
      <DialogContent className="max-w-2xl bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100 shadow-2xl p-0 overflow-hidden border border-slate-200 dark:border-slate-800">
        {/* Search input bar */}
        <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-slate-50/70 dark:bg-slate-900/50">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Train ID, Track Sector (e.g. C12), Work Order #, Defect ID..."
            className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          <span className="text-[10px] font-mono font-bold bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">
            ESC to close
          </span>
        </div>

        {/* Search results body */}
        <div className="max-h-[420px] overflow-y-auto p-4 space-y-4">
          {/* Work Orders */}
          <div>
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Wrench className="h-3.5 w-3.5 text-blue-500" />
              Work Orders & Dispatches ({filteredWOs.length})
            </div>
            <div className="space-y-1.5">
              {filteredWOs.length === 0 ? (
                <div className="text-xs text-slate-400 font-mono py-1">No matching work orders</div>
              ) : (
                filteredWOs.map((wo) => (
                  <button
                    key={wo.id}
                    type="button"
                    onClick={() => handleSelectWO(wo)}
                    className="w-full p-2.5 rounded bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-left transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">{wo.id}</span>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{wo.issueType}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        {wo.assetTrack} &bull; {wo.assignedCrew}
                      </div>
                    </div>
                    <StatusBadge status={wo.status} showIcon={false} className="text-[9px]" />
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Defect Reports */}
          <div>
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <FileWarning className="h-3.5 w-3.5 text-red-500" />
              Live Defect Reports ({filteredReports.length})
            </div>
            <div className="space-y-1.5">
              {filteredReports.length === 0 ? (
                <div className="text-xs text-slate-400 font-mono py-1">No matching defect reports</div>
              ) : (
                filteredReports.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleSelectReport(r.id)}
                    className="w-full p-2.5 rounded bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-left transition-all"
                  >
                    <div className="truncate max-w-[450px]">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">{r.id}</span>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{r.description}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        SECTOR: {r.corridorId} &bull; ASSET: {r.assetId}
                      </div>
                    </div>
                    <StatusBadge status={r.confirmedSeverity || r.aiSeverity} showIcon={false} className="text-[9px]" />
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Corridors */}
          <div>
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Train className="h-3.5 w-3.5 text-emerald-500" />
              Rail Corridors & Sectors ({filteredCorridors.length})
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredCorridors.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelectCorridor(c.id)}
                  className="p-2.5 rounded bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-left transition-all"
                >
                  <div>
                    <div className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400">[{c.id}] {c.name}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 truncate">{c.section}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
