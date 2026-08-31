import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { railwayApi } from '@/services/api';
import { useUIStore } from '@/store/uiStore';
import { Block, BlockStatus } from '@/types/railway';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { DepartmentBadge } from '@/components/common/DepartmentBadge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { formatDateTime, formatDuration } from '@/lib/utils';

import {
  CalendarClock,
  CheckCircle,
  XCircle,
  Edit3,
  Layers,
  Search,
  CheckCircle2,
  BrainCircuit,
  Gauge,
  Clock3,
  Network,
} from 'lucide-react';

export function BlockPlanningPage() {
  const queryClient = useQueryClient();
  const { activeCorridorFilter, setActiveCorridorFilter } = useUIStore();

  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [modifyBlock, setModifyBlock] = useState<Block | null>(null);
  const [rejectBlock, setRejectBlock] = useState<Block | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('Train timetable conflict with Vande Bharat Express.');
  const [editStartTime, setEditStartTime] = useState<string>('');
  const [editEndTime, setEditEndTime] = useState<string>('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Queries
  const { data: corridors = [] } = useQuery({
    queryKey: ['corridors'],
    queryFn: railwayApi.getCorridors,
  });

  const { data: blocks = [], isLoading } = useQuery({
    queryKey: ['blocks', { status: activeTab }],
    queryFn: () => railwayApi.getBlocks(activeTab === 'ALL' ? undefined : (activeTab as BlockStatus)),
  });

  // Mutations
  const updateBlockStatusMutation = useMutation({
    mutationFn: ({ blockId, status }: { blockId: string; status: BlockStatus }) =>
      railwayApi.updateBlockStatus(blockId, status),
    onSuccess: (updatedBlock) => {
      queryClient.invalidateQueries({ queryKey: ['blocks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      setActionSuccessMsg(`Block [${updatedBlock.id}] marked as ${updatedBlock.status}.`);
      setTimeout(() => {
        setActionSuccessMsg(null);
        setRejectBlock(null);
      }, 2500);
    },
  });

  const updateBlockTimeMutation = useMutation({
    mutationFn: ({
      blockId,
      startTime,
      endTime,
    }: {
      blockId: string;
      startTime: string;
      endTime: string;
    }) => railwayApi.updateBlockTime(blockId, startTime, endTime),
    onSuccess: (updatedBlock) => {
      queryClient.invalidateQueries({ queryKey: ['blocks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      setActionSuccessMsg(`Block [${updatedBlock.id}] schedule modified & saved.`);
      setTimeout(() => {
        setActionSuccessMsg(null);
        setModifyBlock(null);
      }, 2500);
    },
  });
  // AI planning summary derived from the current block plan.
  const recommendedBlocks = blocks.filter((b) => b.status === 'RECOMMENDED');
  const coordinatedBlocks = blocks.filter(
    (b) => b.departmentsInvolved.length >= 2
  );

  const totalPlannedMinutes = blocks.reduce(
    (total, block) =>
      total + calculateDurationMinutes(block.startTime, block.endTime),
    0
  );

  const averagePriorityScore =
    recommendedBlocks.length > 0
      ? Math.round(
        (recommendedBlocks.reduce(
          (total, block) => total + block.taskIds.length * 20,
          0
        ) /
          recommendedBlocks.reduce(
            (total, block) => total + block.taskIds.length,
            0
          )) *
        1
      )
      : 0;

  const coordinationRate =
    blocks.length > 0
      ? Math.round((coordinatedBlocks.length / blocks.length) * 100)
      : 0;

  const planningCorridors = new Set(blocks.map((b) => b.corridorId)).size;
  const planningDepartments = new Set(
    blocks.flatMap((b) => b.departmentsInvolved)
  ).size;
  // Filter blocks
  const filteredBlocks = blocks.filter((b) => {
    if (activeCorridorFilter !== 'ALL' && b.corridorId !== activeCorridorFilter) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        b.id.toLowerCase().includes(q) ||
        b.corridorId.toLowerCase().includes(q) ||
        b.departmentsInvolved.some((d) => d.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleApprove = (blockId: string) => {
    updateBlockStatusMutation.mutate({ blockId, status: 'APPROVED' });
  };

  const handleOpenModifyModal = (block: Block) => {
    setModifyBlock(block);
    setEditStartTime(block.startTime.slice(0, 16));
    setEditEndTime(block.endTime.slice(0, 16));
  };

  const handleSaveModifiedTime = () => {
    if (!modifyBlock) return;
    updateBlockTimeMutation.mutate({
      blockId: modifyBlock.id,
      startTime: new Date(editStartTime).toISOString(),
      endTime: new Date(editEndTime).toISOString(),
    });
  };

  const handleConfirmReject = () => {
    if (!rejectBlock) return;
    updateBlockStatusMutation.mutate({ blockId: rejectBlock.id, status: 'REJECTED' });
  };

  const calculateDurationMinutes = (start: string, end: string) => {
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    return Math.max(0, Math.round((e - s) / 60000));
  };

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h1 className="text-base sm:text-lg font-bold tracking-wider uppercase text-slate-100 font-mono flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-blue-400" />
            Maintenance Block Schedule Planning
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            TRAIN TIMETABLE DISCONNECTION SLOTS &bull; SUPERVISOR APPROVAL & REJECTION REGISTER
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
          <span>SCHEDULED BLOCKS:</span>
          <span className="bg-slate-900 px-2 py-1 border border-slate-700 text-blue-400 font-bold">
            {filteredBlocks.length}
          </span>
        </div>
      </div>

      {/* Success Banner */}
      {actionSuccessMsg && (
        <div className="bg-emerald-950/80 border border-emerald-700 p-2.5 text-xs font-mono text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}
      {/* AI Planning Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Card className="border-slate-800">
          <CardContent className="p-3">
            <p className="text-[10px] font-mono text-slate-400 uppercase">
              AI Recommended Blocks
            </p>
            <p className="text-2xl font-bold text-blue-400 font-mono mt-1">
              {recommendedBlocks.length}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-800">
          <CardContent className="p-3">
            <p className="text-[10px] font-mono text-slate-400 uppercase">
              Coordinated Blocks
            </p>
            <p className="text-2xl font-bold text-emerald-400 font-mono mt-1">
              {coordinatedBlocks.length}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-800">
          <CardContent className="p-3">
            <p className="text-[10px] font-mono text-slate-400 uppercase">
              Planning Corridors
            </p>
            <p className="text-2xl font-bold text-sky-400 font-mono mt-1">
              {planningCorridors}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-800">
          <CardContent className="p-3">
            <p className="text-[10px] font-mono text-slate-400 uppercase">
              Departments Coordinated
            </p>
            <p className="text-2xl font-bold text-purple-400 font-mono mt-1">
              {planningDepartments}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-800">
          <CardContent className="p-3">
            <p className="text-[10px] font-mono text-slate-400 uppercase">
              Coordination Rate
            </p>
            <p className="text-2xl font-bold text-amber-400 font-mono mt-1">
              {coordinationRate}%
            </p>
          </CardContent>
        </Card>
      </div>
      {/* AI Planning Intelligence */}
      <div className="border border-blue-900/60 bg-blue-950/10 p-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-blue-300">
                AI PLANNING INTELLIGENCE
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
                OPTIMIZED
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono mt-1">
              MULTI-DEPARTMENT COORDINATION • ASSET AVAILABILITY OPTIMIZATION
            </p>
          </div>

          <div className="text-[10px] font-mono text-emerald-400">
            {planningCorridors} CORRIDORS • {planningDepartments} DEPARTMENTS
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
          <div className="bg-slate-950/70 border border-slate-800 p-2.5">
            <div className="text-[9px] text-slate-500 font-mono uppercase">
              AI Recommended
            </div>
            <div className="text-lg font-bold text-blue-400 font-mono mt-1">
              {recommendedBlocks.length}
            </div>
            <div className="text-[9px] text-slate-500 font-mono">
              candidate blocks
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-2.5">
            <div className="text-[9px] text-slate-500 font-mono uppercase">
              Coordinated
            </div>
            <div className="text-lg font-bold text-cyan-400 font-mono mt-1">
              {coordinatedBlocks.length}
            </div>
            <div className="text-[9px] text-slate-500 font-mono">
              multi-department
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-2.5">
            <div className="text-[9px] text-slate-500 font-mono uppercase">
              Coordination Rate
            </div>
            <div className="text-lg font-bold text-emerald-400 font-mono mt-1">
              {coordinationRate}%
            </div>
            <div className="text-[9px] text-slate-500 font-mono">
              blocks combined
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-2.5">
            <div className="text-[9px] text-slate-500 font-mono uppercase">
              Planned Window
            </div>
            <div className="text-lg font-bold text-amber-400 font-mono mt-1">
              {formatDuration(totalPlannedMinutes)}
            </div>
            <div className="text-[9px] text-slate-500 font-mono">
              total block time
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-2.5">
            <div className="text-[9px] text-slate-500 font-mono uppercase">
              Priority Score
            </div>
            <div className="text-lg font-bold text-violet-400 font-mono mt-1">
              {averagePriorityScore}/100
            </div>
            <div className="text-[9px] text-slate-500 font-mono">
              AI task priority
            </div>
          </div>
        </div>
      </div>
      {/* Filter Tabs & Corridor Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-950 border border-slate-800 p-3">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="ALL">ALL BLOCKS</TabsTrigger>
            <TabsTrigger value="RECOMMENDED">
              RECOMMENDED ({blocks.filter(b => b.status === 'RECOMMENDED').length})
            </TabsTrigger>
            <TabsTrigger value="APPROVED">APPROVED</TabsTrigger>
            <TabsTrigger value="MODIFIED">MODIFIED</TabsTrigger>
            <TabsTrigger value="REJECTED">REJECTED</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by Block ID or dept..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 pr-2 bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 placeholder-slate-500 rounded-none focus:outline-none focus:border-slate-500"
            />
          </div>

          {/* Corridor dropdown */}
          <select
            value={activeCorridorFilter}
            onChange={(e) => setActiveCorridorFilter(e.target.value)}
            className="h-8 bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 px-2 rounded-none focus:outline-none focus:border-slate-500"
          >
            <option value="ALL">ALL CORRIDORS</option>
            {corridors.map((c) => (
              <option key={c.id} value={c.id}>
                [{c.id}] {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Block Table */}
      <Card className="border-slate-800 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 border-b border-slate-800 text-[11px] uppercase font-mono text-slate-400">
                <tr>
                  <th className="px-3 py-2.5">Block ID</th>
                  <th className="px-3 py-2.5">Corridor / Section</th>
                  <th className="px-3 py-2.5">Timetable Window (Start &rarr; End IST)</th>
                  <th className="px-3 py-2.5">Duration</th>
                  <th className="px-3 py-2.5">Departments Combined</th>
                  <th className="px-3 py-2.5">Linked Tasks</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5 text-right">Supervisor Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-400 font-mono">
                      FETCHING BLOCK TIMETABLE SCHEDULES...
                    </td>
                  </tr>
                ) : filteredBlocks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-400 font-mono">
                      NO MAINTENANCE BLOCKS FOUND UNDER ACTIVE STATUS FILTER.
                    </td>
                  </tr>
                ) : (
                  filteredBlocks.map((block) => {
                    const corridor = corridors.find((c) => c.id === block.corridorId);
                    const durationMins = calculateDurationMinutes(block.startTime, block.endTime);
                    const isRecommended = block.status === 'RECOMMENDED';

                    return (
                      <tr
                        key={block.id}
                        className={`transition-colors hover:bg-slate-800/40 ${isRecommended ? 'bg-slate-900/60' : ''
                          }`}
                      >
                        {/* Block ID */}
                        <td className="px-3 py-3 font-bold text-sky-400">
                          {block.id}
                        </td>

                        {/* Corridor */}
                        <td className="px-3 py-3">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-200">
                              [{block.corridorId}] {corridor?.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-sans">
                              {corridor?.section}
                            </span>
                          </div>
                        </td>

                        {/* Window */}
                        <td className="px-3 py-3 text-slate-300">
                          <div className="flex flex-col font-mono text-[11px]">
                            <span className="text-emerald-400">
                              START: {formatDateTime(block.startTime)}
                            </span>
                            <span className="text-amber-400">
                              END: &nbsp;&nbsp;{formatDateTime(block.endTime)}
                            </span>
                          </div>
                        </td>

                        {/* Duration */}
                        <td className="px-3 py-3 text-slate-200 font-bold">
                          {formatDuration(durationMins)}
                        </td>

                        {/* Departments */}
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap gap-1">
                            {block.departmentsInvolved.map((dept) => (
                              <DepartmentBadge
                                key={dept}
                                department={dept}
                                showIcon={false}
                                className="text-[9px] py-0 px-1"
                              />
                            ))}
                          </div>
                        </td>

                        {/* Linked Tasks */}
                        <td className="px-3 py-3 text-slate-300">
                          <div className="flex items-center gap-1">
                            <Layers className="h-3 w-3 text-slate-400" />
                            <span>{block.taskIds.length} tasks</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-3 py-3">
                          <StatusBadge status={block.status} className="text-[10px]" />
                        </td>

                        {/* Action buttons */}
                        <td className="px-3 py-3 text-right">
                          {isRecommended ? (
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Approve */}
                              <Button
                                variant="success"
                                size="xs"
                                onClick={() => handleApprove(block.id)}
                                disabled={updateBlockStatusMutation.isPending}
                                className="font-mono text-[10px] flex items-center gap-1"
                                title="Approve Block"
                              >
                                <CheckCircle className="h-3 w-3" />
                                Approve
                              </Button>

                              {/* Modify */}
                              <Button
                                variant="secondary"
                                size="xs"
                                onClick={() => handleOpenModifyModal(block)}
                                disabled={updateBlockStatusMutation.isPending}
                                className="font-mono text-[10px] flex items-center gap-1"
                                title="Modify Time Slot"
                              >
                                <Edit3 className="h-3 w-3" />
                                Modify
                              </Button>

                              {/* Reject */}
                              <Button
                                variant="destructive"
                                size="xs"
                                onClick={() => setRejectBlock(block)}
                                disabled={updateBlockStatusMutation.isPending}
                                className="font-mono text-[10px] flex items-center gap-1"
                                title="Reject Block"
                              >
                                <XCircle className="h-3 w-3" />
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-mono uppercase">
                              LOCKED ({block.status})
                            </span>
                          )}
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

      {/* Modify Block Schedule Dialog */}
      <Dialog open={!!modifyBlock} onOpenChange={(open) => !open && setModifyBlock(null)}>
        <DialogContent maxWidth="max-w-md" onClose={() => setModifyBlock(null)}>
          {modifyBlock && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle>
                  <span>Modify Block Time Window</span>
                  <span className="text-sky-400 font-mono">[{modifyBlock.id}]</span>
                </DialogTitle>
                <div className="text-xs text-slate-400 font-mono">
                  Corridor: {modifyBlock.corridorId}
                </div>
              </DialogHeader>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">
                    NEW START TIME (IST):
                  </label>
                  <input
                    type="datetime-local"
                    value={editStartTime}
                    onChange={(e) => setEditStartTime(e.target.value)}
                    className="w-full h-8 bg-slate-900 border border-slate-700 text-slate-100 text-xs px-2 rounded-none focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">
                    NEW END TIME (IST):
                  </label>
                  <input
                    type="datetime-local"
                    value={editEndTime}
                    onChange={(e) => setEditEndTime(e.target.value)}
                    className="w-full h-8 bg-slate-900 border border-slate-700 text-slate-100 text-xs px-2 rounded-none focus:outline-none"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="secondary" size="sm" onClick={() => setModifyBlock(null)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveModifiedTime}
                  disabled={updateBlockTimeMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-mono"
                >
                  {updateBlockTimeMutation.isPending ? 'Saving...' : 'Save Modified Schedule'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Block Confirmation Dialog */}
      <Dialog open={!!rejectBlock} onOpenChange={(open) => !open && setRejectBlock(null)}>
        <DialogContent maxWidth="max-w-md" onClose={() => setRejectBlock(null)}>
          {rejectBlock && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle className="text-red-400">
                  <XCircle className="h-4 w-4" />
                  <span>Reject Maintenance Block [{rejectBlock.id}]</span>
                </DialogTitle>
                <div className="text-xs text-slate-400 font-mono">
                  Corridor {rejectBlock.corridorId} &bull; {rejectBlock.departmentsInvolved.join(', ')}
                </div>
              </DialogHeader>

              <div className="space-y-2 font-mono text-xs">
                <label className="block text-[10px] text-slate-300">
                  REJECTION JUSTIFICATION / CONFLICT REASON:
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-none focus:outline-none focus:border-red-600"
                />
              </div>

              <DialogFooter>
                <Button variant="secondary" size="sm" onClick={() => setRejectBlock(null)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleConfirmReject}
                  disabled={updateBlockStatusMutation.isPending}
                  className="font-mono bg-red-950 hover:bg-red-900 text-red-200 border-red-800"
                >
                  {updateBlockStatusMutation.isPending ? 'Rejecting...' : 'Confirm Block Rejection'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
