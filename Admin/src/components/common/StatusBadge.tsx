import { Badge } from '@/components/ui/badge';
import { Severity, BlockStatus, WorkOrderStatus } from '@/types/railway';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Info,
  ShieldAlert,
  Activity,
  Truck,
  Wrench,
  Package,
} from 'lucide-react';

type ExtendedStatus =
  | Severity
  | BlockStatus
  | WorkOrderStatus
  | "HEALTHY"
  | "WARNING"
  | "NEW"
  | "REVIEWED"
  | "CONVERTED"
  | "PENDING"
  | "COORDINATED"
  | "SCHEDULED"
  | "DONE";

interface StatusBadgeProps {
  status: ExtendedStatus | string;
  showIcon?: boolean;
  className?: string;
}

export function StatusBadge({ status, showIcon = true, className }: StatusBadgeProps) {
  const upper = (status || "").toUpperCase();

  switch (upper) {
    // Severity Statuses
    case "CRITICAL":
      return (
        <Badge variant="critical" className={className}>
          {showIcon && <ShieldAlert className="w-3 h-3 mr-1 text-red-600 dark:text-red-400" />}
          CRITICAL
        </Badge>
      );
    case "HIGH":
      return (
        <Badge variant="high" className={className}>
          {showIcon && <AlertTriangle className="w-3 h-3 mr-1 text-orange-600 dark:text-orange-400" />}
          HIGH
        </Badge>
      );
    case "MEDIUM":
      return (
        <Badge variant="medium" className={className}>
          {showIcon && <Activity className="w-3 h-3 mr-1 text-amber-600 dark:text-amber-400" />}
          MEDIUM
        </Badge>
      );
    case "LOW":
      return (
        <Badge variant="low" className={className}>
          {showIcon && <Info className="w-3 h-3 mr-1 text-blue-600 dark:text-blue-400" />}
          LOW
        </Badge>
      );

    // Corridor & Asset Health
    case "HEALTHY":
      return (
        <Badge variant="healthy" className={className}>
          {showIcon && <CheckCircle className="w-3 h-3 mr-1 text-emerald-600 dark:text-emerald-400" />}
          HEALTHY
        </Badge>
      );
    case "WARNING":
      return (
        <Badge variant="warning" className={className}>
          {showIcon && <AlertTriangle className="w-3 h-3 mr-1 text-amber-600 dark:text-amber-400" />}
          WARNING
        </Badge>
      );

    // Work Order Statuses
    case "IN_PROGRESS":
      return (
        <Badge
          variant="outline"
          className={`border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 font-semibold ${className || ''}`}
        >
          {showIcon && <Wrench className="w-3 h-3 mr-1 text-blue-600 dark:text-blue-400 animate-spin" />}
          IN PROGRESS
        </Badge>
      );
    case "DISPATCHED":
      return (
        <Badge
          variant="outline"
          className={`border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 font-semibold ${className || ''}`}
        >
          {showIcon && <Truck className="w-3 h-3 mr-1 text-indigo-600 dark:text-indigo-400" />}
          DISPATCHED
        </Badge>
      );
    case "PENDING_PARTS":
      return (
        <Badge
          variant="outline"
          className={`border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 font-semibold ${className || ''}`}
        >
          {showIcon && <Package className="w-3 h-3 mr-1 text-amber-600 dark:text-amber-400" />}
          PENDING PARTS
        </Badge>
      );
    case "COMPLETED":
    case "DONE":
      return (
        <Badge variant="healthy" className={className}>
          {showIcon && <CheckCircle className="w-3 h-3 mr-1 text-emerald-600 dark:text-emerald-400" />}
          COMPLETED
        </Badge>
      );

    // Block Statuses
    case "APPROVED":
      return (
        <Badge variant="approved" className={className}>
          {showIcon && <CheckCircle className="w-3 h-3 mr-1 text-emerald-600 dark:text-emerald-400" />}
          APPROVED
        </Badge>
      );
    case "RECOMMENDED":
      return (
        <Badge
          variant="secondary"
          className={`border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 ${className || ''}`}
        >
          {showIcon && <Clock className="w-3 h-3 mr-1 text-blue-600 dark:text-blue-400" />}
          RECOMMENDED
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge variant="rejected" className={className}>
          {showIcon && <XCircle className="w-3 h-3 mr-1 text-rose-600 dark:text-rose-400" />}
          REJECTED
        </Badge>
      );
    case "MODIFIED":
      return (
        <Badge variant="modified" className={className}>
          {showIcon && <Activity className="w-3 h-3 mr-1 text-purple-600 dark:text-purple-400" />}
          MODIFIED
        </Badge>
      );

    // Report Statuses
    case "NEW":
      return (
        <Badge
          variant="outline"
          className={`border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 ${className || ''}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mr-1.5 animate-ping" />
          NEW
        </Badge>
      );
    case "REVIEWED":
      return (
        <Badge
          variant="outline"
          className={`border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 ${className || ''}`}
        >
          REVIEWED
        </Badge>
      );
    case "CONVERTED":
      return (
        <Badge
          variant="secondary"
          className={`border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 ${className || ''}`}
        >
          TASK GENERATED
        </Badge>
      );

    default:
      return (
        <Badge variant="default" className={className}>
          {upper}
        </Badge>
      );
  }
}
