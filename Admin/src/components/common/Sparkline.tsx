

interface SparklineProps {
  data: number[];
  color?: string;
  fillColor?: string;
  width?: number;
  height?: number;
  className?: string;
}

export function Sparkline({
  data,
  color = '#2563EB',
  fillColor = 'rgba(37, 99, 235, 0.15)',
  width = 100,
  height = 32,
  className = '',
}: SparklineProps) {
  if (!data || data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;
  const padding = 2;
  const graphHeight = height - padding * 2;
  const graphWidth = width - padding * 2;

  const points = data.map((val, idx) => {
    const x = padding + (idx / (data.length - 1)) * graphWidth;
    const y = padding + graphHeight - ((val - min) / range) * graphHeight;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const areaD = `${pathD} L ${width - padding},${height} L ${padding},${height} Z`;

  const lastPoint = points[points.length - 1].split(',');

  return (
    <div className={`inline-block ${className}`} style={{ width, height }}>
      <svg width={width} height={height} className="overflow-visible">
        {/* Fill area */}
        <path d={areaD} fill={fillColor} />
        {/* Stroke line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Last data point pulsing indicator */}
        <circle
          cx={parseFloat(lastPoint[0])}
          cy={parseFloat(lastPoint[1])}
          r="3"
          fill={color}
          stroke="#ffffff"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}
