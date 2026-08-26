import { Severity } from '@/types/railway';
import { StatusBadge } from './StatusBadge';
import { cn } from '@/lib/utils';

interface SeverityIndicatorProps {
  severity: Severity;
  confidence?: number; // 0-1
  confirmedSeverity?: Severity | null;
  className?: string;
  compact?: boolean;
}

export function SeverityIndicator({
  severity,
  confidence,
  confirmedSeverity,
  className,
  compact = false,
}: SeverityIndicatorProps) {
  const displaySeverity = confirmedSeverity || severity;
  const isOverridden = confirmedSeverity && confirmedSeverity !== severity;

  const getBarColor = (s: Severity) => {
    switch (s) {
      case 'CRITICAL':
        return 'bg-red-500';
      case 'HIGH':
        return 'bg-orange-500';
      case 'MEDIUM':
        return 'bg-amber-500';
      case 'LOW':
        return 'bg-blue-500';
    }
  };

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-center gap-2">
        <StatusBadge status={displaySeverity} />
        {isOverridden && (
          <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-1 border border-amber-800">
            OVERRIDDEN
          </span>
        )}
      </div>

      {!compact && confidence !== undefined && (
        <div className="flex items-center gap-2 mt-0.5">
          <div className="h-1.5 w-16 bg-slate-800 rounded-none overflow-hidden flex border border-slate-700">
            <div
              className={cn("h-full", getBarColor(severity))}
              style={{ width: `${Math.round(confidence * 100)}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            AI: {Math.round(confidence * 100)}%
          </span>
        </div>
      )}
    </div>
  );
}
