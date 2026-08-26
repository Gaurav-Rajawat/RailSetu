import { useState } from 'react';
import { useUIStore } from '@/store/uiStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { railwayApi } from '@/services/api';
import { WorkOrderStatus } from '@/types/railway';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { DepartmentBadge } from '@/components/common/DepartmentBadge';
import {
  Wrench,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  Truck,
} from 'lucide-react';

export function WorkOrderDetailModal() {
  const queryClient = useQueryClient();
  const { selectedWorkOrder, setSelectedWorkOrder } = useUIStore();
  const [selectedStatus, setSelectedStatus] = useState<WorkOrderStatus | ''>('');
  const [newProgress, setNewProgress] = useState<number>(0);

  const isOpen = !!selectedWorkOrder;

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, progress }: { id: string; status: WorkOrderStatus; progress: number }) => {
      return railwayApi.updateWorkOrderStatus(id, status, progress);
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['workOrders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      setSelectedWorkOrder(updated);
    },
  });

  if (!selectedWorkOrder) return null;

  const handleUpdate = () => {
    const statusToSet = (selectedStatus || selectedWorkOrder.status) as WorkOrderStatus;
    const progressToSet = newProgress || selectedWorkOrder.progressPercent;
    updateMutation.mutate({
      id: selectedWorkOrder.id,
      status: statusToSet,
      progress: progressToSet,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && setSelectedWorkOrder(null)}>
      <DialogContent className="max-w-xl bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100 shadow-2xl p-0 overflow-hidden border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="bg-slate-900 dark:bg-slate-950 p-4 text-white border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/30 border border-blue-500 rounded">
              <Wrench className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold uppercase tracking-wider text-white">
                Work Order Inspection &bull; {selectedWorkOrder.id}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 font-mono">
                {selectedWorkOrder.zone} &bull; Sector {selectedWorkOrder.corridorId}
              </DialogDescription>
            </div>
          </div>
          <StatusBadge status={selectedWorkOrder.status} />
        </div>

        <div className="p-5 space-y-4">
          {/* Main Info Box */}
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                {selectedWorkOrder.issueType}
              </span>
              <DepartmentBadge department={selectedWorkOrder.department} />
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              <span className="font-semibold text-slate-800 dark:text-slate-200">Action Plan:</span> {selectedWorkOrder.actionRequired}
            </div>

            {/* Progress Bar */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-500 dark:text-slate-400">EXECUTION PROGRESS:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{selectedWorkOrder.progressPercent}%</span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${selectedWorkOrder.progressPercent}%` }}
                />
              </div>
            </div>

            {/* Grid of metadata */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-800 text-[11px] font-mono">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <MapPin className="h-3.5 w-3.5 text-red-500" />
                <span>{selectedWorkOrder.assetTrack}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <Truck className="h-3.5 w-3.5 text-indigo-500" />
                <span className="truncate">{selectedWorkOrder.assignedCrew}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <Clock className="h-3.5 w-3.5 text-amber-500" />
                <span>Est. {selectedWorkOrder.estimatedDurationHours} Hours</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <AlertCircle className="h-3.5 w-3.5 text-blue-500" />
                <span>Priority: {selectedWorkOrder.priority}</span>
              </div>
            </div>
          </div>

          {/* Quick status update controls */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
              UPDATE STATUS & PROGRESS:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['IN_PROGRESS', 'DISPATCHED', 'PENDING_PARTS', 'COMPLETED'] as WorkOrderStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    setSelectedStatus(st);
                    if (st === 'COMPLETED') setNewProgress(100);
                  }}
                  className={`p-2 rounded text-xs font-mono font-bold uppercase tracking-wider border transition-all ${
                    (selectedStatus || selectedWorkOrder.status) === st
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Progress adjustment slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono text-slate-600 dark:text-slate-400">
              <span>Adjust Progress %:</span>
              <span className="font-bold">{newProgress || selectedWorkOrder.progressPercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={newProgress || selectedWorkOrder.progressPercent}
              onChange={(e) => setNewProgress(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <Button variant="ghost" onClick={() => setSelectedWorkOrder(null)}>
              Close
            </Button>
            <Button
              variant="primary"
              size="default"
              onClick={handleUpdate}
              disabled={updateMutation.isPending}
              className="gap-2 font-mono"
            >
              <CheckCircle className="h-4 w-4" />
              {updateMutation.isPending ? 'UPDATING...' : 'SAVE WORK ORDER'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
