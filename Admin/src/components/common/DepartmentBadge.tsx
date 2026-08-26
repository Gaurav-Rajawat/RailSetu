import { Badge } from '@/components/ui/badge';
import { GitCommit, Radio, Zap } from 'lucide-react';

interface DepartmentBadgeProps {
  department: string;
  showIcon?: boolean;
  className?: string;
}

export function DepartmentBadge({ department, showIcon = true, className }: DepartmentBadgeProps) {
  const dept = (department || "").toUpperCase();

  switch (dept) {
    case "TRACK":
      return (
        <Badge
          variant="outline"
          className={`border-cyan-300 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60 font-semibold ${className || ''}`}
        >
          {showIcon && <GitCommit className="w-3 h-3 mr-1 text-cyan-600 dark:text-cyan-400" />}
          TRACK (P-WAY)
        </Badge>
      );
    case "SIGNAL":
      return (
        <Badge
          variant="outline"
          className={`border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 font-semibold ${className || ''}`}
        >
          {showIcon && <Radio className="w-3 h-3 mr-1 text-amber-600 dark:text-amber-400" />}
          SIGNAL & S&T
        </Badge>
      );
    case "OHE":
      return (
        <Badge
          variant="outline"
          className={`border-fuchsia-300 dark:border-fuchsia-800 text-fuchsia-700 dark:text-fuchsia-300 bg-fuchsia-50 dark:bg-fuchsia-950/60 font-semibold ${className || ''}`}
        >
          {showIcon && <Zap className="w-3 h-3 mr-1 text-fuchsia-600 dark:text-fuchsia-400" />}
          OHE / TRD
        </Badge>
      );
    default:
      return (
        <Badge variant="default" className={className}>
          {dept}
        </Badge>
      );
  }
}
