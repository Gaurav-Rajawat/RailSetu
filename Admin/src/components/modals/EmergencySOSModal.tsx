import { useState } from 'react';
import { useUIStore } from '@/store/uiStore';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  AlertOctagon,
  ShieldAlert,
  ZapOff,
  Radio,
  Users,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export function EmergencySOSModal() {
  const { isEmergencyModalOpen, setEmergencyModalOpen, activeCorridorFilter } = useUIStore();
  const [selectedProtocol, setSelectedProtocol] = useState<'ISOLATE' | 'POWER_CUT' | 'BROADCAST' | 'STAND_DOWN'>('ISOLATE');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionSuccess, setExecutionSuccess] = useState<string | null>(null);

  const handleExecuteProtocol = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      if (selectedProtocol === 'ISOLATE') {
        setExecutionSuccess(`EMERGENCY BLOCK CODE [EB-991] ENGAGED. Section ${activeCorridorFilter === 'ALL' ? 'NATIONAL NETWORK' : activeCorridorFilter} signals clamped to STOP.`);
      } else if (selectedProtocol === 'POWER_CUT') {
        setExecutionSuccess(`OHE TRACTION POWER ISOLATED. Feeder circuit breakers open for sector.`);
      } else if (selectedProtocol === 'BROADCAST') {
        setExecutionSuccess(`URGENT ALL-STATION VHF EMERGENCY BROADCAST DISPATCHED TO ALL LOCO PILOTS.`);
      } else {
        setExecutionSuccess(`ALL MAINTENANCE GANGS ORDERED TO STAND-DOWN AND CLEAR TRACK BUFFER.`);
      }
    }, 900);
  };

  const handleClose = () => {
    setEmergencyModalOpen(false);
    setExecutionSuccess(null);
  };

  return (
    <Dialog open={isEmergencyModalOpen} onOpenChange={setEmergencyModalOpen}>
      <DialogContent className="max-w-xl border-red-500/80 bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100 shadow-2xl p-0 overflow-hidden">
        {/* Red emergency banner header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-700 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded backdrop-blur-sm animate-pulse">
              <AlertOctagon className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold uppercase tracking-wider text-white flex items-center gap-2">
                CRITICAL EMERGENCY SOS OVERRIDE
              </DialogTitle>
              <DialogDescription className="text-xs text-red-100 font-sans mt-0.5">
                Central Operations Board &bull; Level-4 Instant Safety Interlock
              </DialogDescription>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold bg-black/40 px-2 py-1 rounded border border-white/20">
            CHIEF CONTROLLER AUTH
          </span>
        </div>

        <div className="p-5 space-y-4">
          {executionSuccess ? (
            <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold uppercase font-mono tracking-wider">PROTOCOL ACTIVATED</h4>
                <p className="text-xs font-mono mt-1">{executionSuccess}</p>
                <div className="mt-3">
                  <Button size="sm" variant="outline" onClick={handleClose}>
                    Dismiss & Return to Dashboard
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="p-3 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 text-xs leading-relaxed flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Executing this command bypasses standard approval queues and immediately transmits override orders to zonal SCADA, signal relays, and locomotive drivers.
                </span>
              </div>

              {/* Protocol Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
                  SELECT RAPID EMERGENCY ACTION:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedProtocol('ISOLATE')}
                    className={`p-3 rounded border text-left flex items-start gap-3 transition-all ${
                      selectedProtocol === 'ISOLATE'
                        ? 'border-red-500 bg-red-50 dark:bg-red-950/60 ring-2 ring-red-500/30'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <AlertOctagon className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase">Emergency Track Clamping</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Clamps all section signals to danger (Red) immediately.</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedProtocol('POWER_CUT')}
                    className={`p-3 rounded border text-left flex items-start gap-3 transition-all ${
                      selectedProtocol === 'POWER_CUT'
                        ? 'border-red-500 bg-red-50 dark:bg-red-950/60 ring-2 ring-red-500/30'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <ZapOff className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase">OHE 25kV Traction Trip</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Remote trips substations to de-energize overhead catenary.</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedProtocol('BROADCAST')}
                    className={`p-3 rounded border text-left flex items-start gap-3 transition-all ${
                      selectedProtocol === 'BROADCAST'
                        ? 'border-red-500 bg-red-50 dark:bg-red-950/60 ring-2 ring-red-500/30'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <Radio className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase">All-Train VHF Warning</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Automated high-priority audio alarm to cab radio units.</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedProtocol('STAND_DOWN')}
                    className={`p-3 rounded border text-left flex items-start gap-3 transition-all ${
                      selectedProtocol === 'STAND_DOWN'
                        ? 'border-red-500 bg-red-50 dark:bg-red-950/60 ring-2 ring-red-500/30'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <Users className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase">Track Gang Evacuate</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Signals all maintenance workers to evacuate cess and track.</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <Button variant="ghost" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="default"
                  onClick={handleExecuteProtocol}
                  disabled={isExecuting}
                  className="gap-2 font-mono"
                >
                  <Lock className="h-4 w-4" />
                  {isExecuting ? 'TRANSMITTING OVERRIDE...' : 'CONFIRM & EXECUTE PROTOCOL'}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
