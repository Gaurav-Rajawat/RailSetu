
interface RadialGaugeProps {
  label: string;
  value: number; // 0 - 100
  unit?: string;
  subtitle?: string;
  kmRemaining?: number;
  size?: number;
  strokeWidth?: number;
  warnThreshold?: number;
  critThreshold?: number;
}

export function RadialGauge({
  label,
  value,
  unit = '%',
  subtitle,
  kmRemaining,
  size = 130,
  strokeWidth = 10,
  warnThreshold = 65,
  critThreshold = 80,
}: RadialGaugeProps) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  // Use a 270 degree arc for gauge look
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (Math.min(value, 100) / 100) * arcLength;

  // Determine color based on threshold
  let strokeColor = '#10B981'; // emerald
  let glowClass = 'shadow-emerald-500/20';
  let badgeText = 'NOMINAL';
  let badgeColor = 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800';

  if (value >= critThreshold) {
    strokeColor = '#EF4444'; // red
    glowClass = 'shadow-red-500/20';
    badgeText = 'CRITICAL WEAR';
    badgeColor = 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800 animate-pulse';
  } else if (value >= warnThreshold) {
    strokeColor = '#F59E0B'; // amber
    glowClass = 'shadow-amber-500/20';
    badgeText = 'WEAR ADVISORY';
    badgeColor = 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800';
  }

  return (
    <div className={`flex flex-col items-center justify-between p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 transition-all hover:border-slate-300 dark:hover:border-slate-700 shadow-sm ${glowClass}`}>
      <div className="flex items-center justify-between w-full mb-1">
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-sans">
          {label}
        </span>
        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${badgeColor}`}>
          {badgeText}
        </span>
      </div>

      {/* SVG Radial Gauge */}
      <div className="relative my-2 flex items-center justify-center">
        <svg
          width={size}
          height={size}
          className="transform -rotate-[135deg]"
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Background Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            className="text-slate-200 dark:text-slate-800"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Foreground Animated Gauge */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 tracking-tight">
            {value}
            <span className="text-xs text-slate-500 dark:text-slate-400 font-sans ml-0.5">{unit}</span>
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono -mt-0.5">
            WEAR INDEX
          </span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="w-full pt-2 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono">
        <span className="text-slate-500 dark:text-slate-400">EST. LIFE:</span>
        <span className="font-bold text-slate-800 dark:text-slate-200">
          {kmRemaining ? `${kmRemaining.toLocaleString()} KM` : subtitle || 'N/A'}
        </span>
      </div>
    </div>
  );
}
