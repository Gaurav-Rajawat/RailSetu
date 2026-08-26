import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { railwayApi } from '@/services/api';
import { useUIStore } from '@/store/uiStore';
import { CorridorCoordinationGroup, MaintenanceTask } from '@/types/railway';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { DepartmentBadge } from '@/components/common/DepartmentBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { formatDuration } from '@/lib/utils';
import {
  GitMerge,
  Clock,
  Zap,
  CheckCircle2,
  CalendarCheck,
  Timer,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';

export function CoordinationPage() {
  const queryClient = useQueryClient();
  const { activeCorridorFilter } = useUIStore();

  // State for proposal modal
  const [selectedGroup, setSelectedGroup] = useState<CorridorCoordinationGroup | null>(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [slotStart, setSlotStart] = useState<string>('');
  const [slotEnd, setSlotEnd] = useState<string>('');
  const [proposalSuccess, setProposalSuccess] = useState<string | null>(null);

  // Queries
  const { data: coordinationGroups = [], isLoading } = useQuery({
    queryKey: ['coordinationOpportunities'],
    queryFn: railwayApi.getCoordinationOpportunities,
  });

  const { data: reports = [] } = useQuery({
    queryKey: ['reports'],
    queryFn: () => railwayApi.getReports(),
  });

  // Mutation to propose block
  const proposeBlockMutation = useMutation({
    mutationFn: (data: {
      corridorId: string;
      taskIds: string[];
      startTime: string;
      endTime: string;
    }) => railwayApi.proposeBlock(data),
    onSuccess: (newBlock) => {
      queryClient.invalidateQueries({ queryKey: ['coordinationOpportunities'] });
      queryClient.invalidateQueries({ queryKey: ['blocks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      setProposalSuccess(`Block [${newBlock.id}] successfully submitted as RECOMMENDED!`);
      setTimeout(() => {
        setProposalSuccess(null);
        setSelectedGroup(null);
      }, 2500);
    },
  });

  const filteredGroups = activeCorridorFilter === 'ALL'
    ? coordinationGroups
    : coordinationGroups.filter(g => g.corridor.id === activeCorridorFilter);

  const handleOpenProposeModal = (group: CorridorCoordinationGroup) => {
    setSelectedGroup(group);
    setSelectedTaskIds(group.tasks.map(t => t.id));
    setSlotStart(group.suggestedSlot.startTime.slice(0, 16));
    setSlotEnd(group.suggestedSlot.endTime.slice(0, 16));
    setProposalSuccess(null);
  };

  const handleToggleTask = (taskId: string) => {
    setSelectedTaskIds(prev =>
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const handleSubmitProposal = () => {
    if (!selectedGroup || selectedTaskIds.length === 0) return;

    proposeBlockMutation.mutate({
      corridorId: selectedGroup.corridor.id,
      taskIds: selectedTaskIds,
      startTime: new Date(slotStart).toISOString(),
      endTime: new Date(slotEnd).toISOString(),
    });
  };

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h1 className="text-base sm:text-lg font-bold tracking-wider uppercase text-slate-100 font-mono flex items-center gap-2">
            <GitMerge className="h-5 w-5 text-sky-400" />
            Multi-Departmental Coordination Engine
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            CONVERGE TRACK (P-WAY), SIGNAL (S&T), AND OHE TRACTION INTO SINGLE DISCONNECTION BLOCKS
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
          <span>OPTIMIZATION ZONES:</span>
          <span className="bg-slate-900 px-2 py-1 border border-slate-700 text-sky-400 font-bold">
            {filteredGroups.length} CORRIDORS
          </span>
        </div>
      </div>

      {/* Control Notice Banner */}
      <div className="bg-slate-900 border border-slate-700 p-3 font-mono text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-slate-200">
          <Zap className="h-4 w-4 text-amber-400 shrink-0" />
          <span>
            <strong>Optimization Principle:</strong> Combining multiple departmental maintenance requests in the same corridor eliminates duplicate track closures and saves hundreds of train disruption minutes.
          </span>
        </div>
        <div className="text-[11px] bg-slate-950 px-2.5 py-1 border border-slate-800 text-emerald-400 flex items-center gap-1 shrink-0">
          <TrendingDown className="h-3.5 w-3.5" />
          <span>EST. TIMETABLE HEADWAY CONSERVATION ACTIVE</span>
        </div>
      </div>

      {/* Corridor Coordination Groups */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 font-mono text-xs border border-slate-800 bg-slate-900">
          ANALYZING MULTI-DEPARTMENTAL CORRIDOR OPPORTUNITIES...
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="p-12 text-center text-slate-400 font-mono text-xs border border-slate-800 bg-slate-900">
          NO PENDING CORRIDOR TASKS READY FOR COORDINATION UNDER CURRENT FILTER.
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filteredGroups.map((group) => {
            const isMultiDept = group.departments.length > 1;

            return (
              <Card
                key={group.corridor.id}
                className={`border ${isMultiDept ? 'border-sky-900/80 bg-slate-900' : 'border-slate-800 bg-slate-900/80'
                  }`}
              >
                {/* Header */}
                <CardHeader className="py-3 px-4 bg-slate-950/80 border-b border-slate-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-sky-400 bg-slate-900 px-2 py-0.5 border border-slate-700">
                        {group.corridor.id}
                      </span>
                      <div>
                        <CardTitle className="text-slate-100 text-sm">
                          {group.corridor.name}
                        </CardTitle>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {group.corridor.section}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusBadge status={group.corridor.healthStatus} className="text-[10px]" />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-4">
                  {/* Coordination Metrics Bar */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-950 border border-slate-800 p-2.5 font-mono text-xs">
                    <div className="text-center border-r border-slate-800 pr-2">
                      <div className="text-[10px] uppercase text-slate-400">Separate Time</div>
                      <div className="text-sm font-bold text-slate-300">
                        {formatDuration(group.totalSeparateDuration)}
                      </div>
                    </div>

                    <div className="text-center border-r border-slate-800 px-2">
                      <div className="text-[10px] uppercase text-sky-400">Combined Block</div>
                      <div className="text-sm font-bold text-sky-300">
                        {formatDuration(group.combinedDuration)}
                      </div>
                    </div>

                    <div className="text-center pl-2">
                      <div className="text-[10px] uppercase text-emerald-400">Track Time Saved</div>
                      <div className="text-sm font-bold text-emerald-400 flex items-center justify-center gap-0.5">
                        <TrendingDown className="h-3.5 w-3.5" />
                        {formatDuration(group.timeSavedMinutes)}
                      </div>
                    </div>
                  </div>

                  {/* Tasks in Corridor */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-mono uppercase text-slate-400 flex items-center justify-between">
                      <span>Tasks Eligible for Single Block ({group.tasks.length}):</span>
                      <div className="flex gap-1.5">
                        {group.departments.map(d => (
                          <DepartmentBadge key={d} department={d} showIcon={false} className="text-[9px] py-0 px-1" />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      {group.tasks.map((task: MaintenanceTask) => {
                        const report = reports.find(r => r.id === task.reportId);

                        return (
                          <div
                            key={task.id}
                            className="bg-slate-950/80 border border-slate-800/80 p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
                          >
                            <div className="flex items-start gap-2.5">
                              <DepartmentBadge department={task.department} />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-200">{task.id}</span>
                                  <span className="text-slate-400 text-[11px]">
                                    (ref: {task.reportId})
                                  </span>
                                </div>
                                <p className="font-sans text-[11px] text-slate-300 mt-0.5 line-clamp-1">
                                  {report?.description || 'Routine corrective maintenance job'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                              <div className="text-right">
                                <div className="text-slate-200 text-xs font-bold flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-slate-400" />
                                  {task.durationMinutes} min
                                </div>
                                <div className="text-[10px] text-amber-400">
                                  Priority: {task.priority}/100
                                </div>
                              </div>
                              <StatusBadge status={task.status} showIcon={false} className="text-[9px] py-0" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>

                {/* Footer Action */}
                <CardFooter className="py-2.5 px-4 bg-slate-950/50 border-t border-slate-800 flex justify-between items-center">
                  <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                    <CalendarCheck className="h-3.5 w-3.5 text-sky-400" />
                    <span>Suggested Night Slot: 01:30 - 04:00 IST</span>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleOpenProposeModal(group)}
                    className="font-mono text-xs bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5"
                  >
                    <span>Propose Coordinated Block</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Propose Block Dialog */}
      <Dialog open={!!selectedGroup} onOpenChange={(open) => !open && setSelectedGroup(null)}>
        <DialogContent maxWidth="max-w-2xl" onClose={() => setSelectedGroup(null)}>
          {selectedGroup && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle>
                  <span>Propose Coordinated Maintenance Block</span>
                  <span className="text-sky-400 font-mono">[{selectedGroup.corridor.id}]</span>
                </DialogTitle>
                <div className="text-xs text-slate-400 font-mono">
                  {selectedGroup.corridor.name} &bull; {selectedGroup.corridor.section}
                </div>
              </DialogHeader>

              {/* Notification Banner */}
              {proposalSuccess && (
                <div className="bg-emerald-950/80 border border-emerald-700 p-2.5 text-xs font-mono text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{proposalSuccess}</span>
                </div>
              )}

              {/* Task selection list */}
              <div className="space-y-2">
                <div className="text-[11px] font-mono uppercase text-slate-300 flex justify-between">
                  <span>Select Tasks to Combine into Block:</span>
                  <span className="text-sky-400">{selectedTaskIds.length} Selected</span>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto border border-slate-800 bg-slate-950 p-2">
                  {selectedGroup.tasks.map((task) => {
                    const isChecked = selectedTaskIds.includes(task.id);
                    return (
                      <div
                        key={task.id}
                        onClick={() => handleToggleTask(task.id)}
                        className={`p-2 border cursor-pointer flex items-center justify-between text-xs font-mono transition-colors ${isChecked
                          ? 'bg-slate-900 border-sky-600 text-slate-100'
                          : 'bg-slate-950 border-slate-800 text-slate-400 opacity-60'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleTask(task.id)}
                            className="rounded-none bg-slate-900 border-slate-700"
                          />
                          <DepartmentBadge department={task.department} showIcon={false} className="text-[9px]" />
                          <span className="font-bold">{task.id}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span>{task.durationMinutes} min</span>
                          <span className="text-amber-400">P:{task.priority}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Timetable Slot Configuration */}
              <div className="border border-slate-800 bg-slate-950 p-3 space-y-3 font-mono text-xs">
                <div className="text-[11px] uppercase text-slate-300 flex items-center gap-1.5">
                  <Timer className="h-3.5 w-3.5 text-amber-400" />
                  Train Timetable Disconnection Slot
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">
                      BLOCK START TIME (IST):
                    </label>
                    <input
                      type="datetime-local"
                      value={slotStart}
                      onChange={(e) => setSlotStart(e.target.value)}
                      className="w-full h-8 bg-slate-900 border border-slate-700 text-slate-100 text-xs px-2 rounded-none focus:outline-none focus:border-slate-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">
                      BLOCK END TIME (IST):
                    </label>
                    <input
                      type="datetime-local"
                      value={slotEnd}
                      onChange={(e) => setSlotEnd(e.target.value)}
                      className="w-full h-8 bg-slate-900 border border-slate-700 text-slate-100 text-xs px-2 rounded-none focus:outline-none focus:border-slate-500 font-mono"
                    />
                  </div>
                </div>

                <div className="bg-slate-900 p-2 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
                  <span>Calculated Block Duration:</span>
                  <strong className="text-sky-400">
                    {formatDuration(selectedGroup.combinedDuration)}
                  </strong>
                </div>
              </div>

              {/* Notice */}
              <div className="text-[11px] text-amber-400/90 font-mono flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>
                  Proposing will create a RECOMMENDED block pending Chief Controller sign-off in Block Planning.
                </span>
              </div>

              <DialogFooter>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedGroup(null)}
                  disabled={proposeBlockMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSubmitProposal}
                  disabled={proposeBlockMutation.isPending || selectedTaskIds.length === 0}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-mono"
                >
                  {proposeBlockMutation.isPending ? 'Generating Block...' : 'Submit Recommended Block'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
