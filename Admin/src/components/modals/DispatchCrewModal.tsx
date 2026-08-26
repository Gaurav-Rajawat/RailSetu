import { useState } from 'react';
import { useUIStore } from '@/store/uiStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { railwayApi } from '@/services/api';
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
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export function DispatchCrewModal() {
  const queryClient = useQueryClient();
  const { isDispatchModalOpen, setDispatchModalOpen, selectedAlertForDispatch } = useUIStore();
  const [selectedCrewId, setSelectedCrewId] = useState<string>('CREW-01');
  const [dispatchNotes, setDispatchNotes] = useState<string>('');
  const [successResult, setSuccessResult] = useState<any>(null);

  const { data: crews = [] } = useQuery({
    queryKey: ['crews'],
    queryFn: railwayApi.getCrewTeams,
    enabled: isDispatchModalOpen,
  });

  const dispatchMutation = useMutation({
    mutationFn: async () => {
      if (!selectedAlertForDispatch) throw new Error('No alert selected');
      return railwayApi.dispatchCrew(selectedAlertForDispatch.id, selectedCrewId, dispatchNotes);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['workOrders'] });
      queryClient.invalidateQueries({ queryKey: ['crews'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      setSuccessResult(data);
    },
  });

  const handleClose = () => {
    setDispatchModalOpen(false);
    setSuccessResult(null);
    setDispatchNotes('');
  };

  const selectedCrew = crews.find(c => c.id === selectedCrewId);

  return (
    <Dialog open={isDispatchModalOpen} onOpenChange={setDispatchModalOpen}>
      <DialogContent className="max-w-xl bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100 shadow-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 dark:bg-slate-950 p-4 text-white border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/30 border border-blue-500 rounded">
              <Truck className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold uppercase tracking-wider text-white">
                Dispatch Maintenance Crew & Special Gang
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 font-mono">
                {selectedAlertForDispatch ? `TARGET: ${selectedAlertForDispatch.id} &bull; CORRIDOR: ${selectedAlertForDispatch.corridorId}` : 'CREW ASSIGNMENT'}
              </DialogDescription>
            </div>
          </div>
          {selectedAlertForDispatch && (
            <StatusBadge status={selectedAlertForDispatch.confirmedSeverity || selectedAlertForDispatch.aiSeverity} showIcon={false} />
          )}
        </div>

        <div className="p-5 space-y-4">
          {successResult ? (
            <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold uppercase font-mono tracking-wider">CREW DISPATCHED SUCCESSFULLY</h4>
                  <p className="text-xs font-mono">
                    Created Work Order <span className="font-bold text-emerald-600 dark:text-emerald-300">{successResult.id}</span> assigned to <span className="font-bold">{successResult.assignedCrew}</span>.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="primary" onClick={handleClose}>
                      Done
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Alert Summary Card */}
              {selectedAlertForDispatch && (
                <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500 dark:text-slate-400">DEFECT DETAILS:</span>
                    <span className="text-sky-600 dark:text-sky-400 font-bold">{selectedAlertForDispatch.assetId}</span>
                  </div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 font-sans leading-relaxed">
                    {selectedAlertForDispatch.description}
                  </p>
                  <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-red-500" />
                      GPS: {selectedAlertForDispatch.gps.lat.toFixed(4)}, {selectedAlertForDispatch.gps.lng.toFixed(4)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-blue-500" />
                      AI CONFIDENCE: {(selectedAlertForDispatch.aiConfidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Crew Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
                  SELECT CREW TO MOBILIZE:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-0.5">
                  {crews.map((crew) => (
                    <button
                      key={crew.id}
                      type="button"
                      onClick={() => setSelectedCrewId(crew.id)}
                      className={`p-2.5 rounded border text-left flex flex-col justify-between transition-all ${selectedCrewId === crew.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 ring-1 ring-blue-500'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {crew.name}
                        </span>
                        <DepartmentBadge department={crew.department} showIcon={false} className="text-[9px] py-0 px-1" />
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between w-full">
                        <span>Lead: {crew.leadName.split(' ')[0]}</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{crew.status}</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 truncate mt-1 flex items-center gap-1">
                        <MapPin className="h-2.5 w-2.5" />
                        {crew.currentLocation}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action notes input */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
                  DISPATCH DIRECTIVES & SAFETY GEAR NOTES:
                </label>
                <input
                  type="text"
                  value={dispatchNotes}
                  onChange={(e) => setDispatchNotes(e.target.value)}
                  placeholder="e.g. Carry portable ultrasonic tester and fishplate clamps..."
                  className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Selected Crew Info Preview */}
              {selectedCrew && (
                <div className="flex items-center justify-between text-[11px] font-mono px-2.5 py-1.5 rounded bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
                  <span className="text-slate-600 dark:text-slate-400">ASSIGNED GANG:</span>
                  <span className="font-bold text-blue-700 dark:text-blue-300">{selectedCrew.name} (Lead: {selectedCrew.leadName})</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <Button variant="ghost" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="default"
                  onClick={() => dispatchMutation.mutate()}
                  disabled={dispatchMutation.isPending}
                  className="gap-2 font-mono"
                >
                  <Truck className="h-4 w-4" />
                  {dispatchMutation.isPending ? 'DISPATCHING...' : 'CONFIRM DISPATCH & GENERATE WO'}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
