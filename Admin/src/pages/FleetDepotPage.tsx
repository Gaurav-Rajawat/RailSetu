import { useQuery } from '@tanstack/react-query';
import { railwayApi } from '@/services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/StatusBadge';
import { RadialGauge } from '@/components/common/RadialGauge';

export function FleetDepotPage() {
  const { data: componentWear } = useQuery({
    queryKey: ['componentWear'],
    queryFn: railwayApi.getComponentWear,
  });

  const rollingStockFleet = [
    { id: 'WAP7-30291', type: 'Electric Passenger Loco', depot: 'Tughlakabad (TKD)', health: 'WARNING', brakeWear: 82, pantographWear: 86, nextPit: 'Tonight 22:00' },
    { id: 'WAG9-31842', type: 'Heavy Freight Loco', depot: 'Vadodara (BRC)', health: 'HEALTHY', brakeWear: 45, pantographWear: 52, nextPit: '3 Days' },
    { id: 'WAP5-30012', type: 'High Speed Passenger Loco', depot: 'Ghaziabad (GZB)', health: 'HEALTHY', brakeWear: 54, pantographWear: 60, nextPit: '4 Days' },
    { id: 'VB-EXP-2041', type: 'Vande Bharat Trainset 16-Car', depot: 'Shakur Basti (SSB)', health: 'WARNING', brakeWear: 76, pantographWear: 79, nextPit: 'Tomorrow 06:00' },
    { id: 'WAG12-60044', type: 'Twin-BoBo 12000 HP Freight', depot: 'Madhepura (MBD)', health: 'HEALTHY', brakeWear: 38, pantographWear: 41, nextPit: '6 Days' },
  ];

  return (
    <div className="space-y-4 max-w-[1680px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3.5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-base sm:text-lg font-black tracking-wider uppercase text-slate-900 dark:text-slate-100 font-mono">
              Fleet Depot & Rolling Stock Diagnostics
            </h1>
            <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded font-mono font-bold border border-blue-200 dark:border-blue-800">
              LOCO & RAKE TELEMETRY
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
            Wear rate models, pit-line maintenance schedules, and wheel-rail interface dynamics
          </p>
        </div>
      </div>

      {/* Fleet Component Wear Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <RadialGauge
          label="Fleet Brake Pad Average"
          value={componentWear?.brakePadsWear || 74}
          kmRemaining={componentWear?.brakePadKmRemaining || 12400}
          warnThreshold={65}
          critThreshold={80}
        />
        <RadialGauge
          label="Wheel Profile / Flange Wear"
          value={componentWear?.wheelProfileWear || 58}
          kmRemaining={componentWear?.wheelProfileKmRemaining || 34200}
          warnThreshold={65}
          critThreshold={80}
        />
        <RadialGauge
          label="Pantograph Carbon Strips"
          value={componentWear?.pantographStripWear || 82}
          kmRemaining={componentWear?.pantographKmRemaining || 4800}
          warnThreshold={65}
          critThreshold={80}
        />
      </div>

      {/* Fleet Roster */}
      <Card>
        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-slate-900 dark:text-slate-100">
              Active Rolling Stock Roster & Wear Diagnostics
            </CardTitle>
            <CardDescription>
              Telemetry stream from on-board locomotive trip event recorders
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-950/80 border-y border-slate-200 dark:border-slate-800 text-[10px] uppercase font-mono text-slate-500 dark:text-slate-400 font-bold select-none">
                <tr>
                  <th className="px-4 py-2.5">Locomotive / Rake ID</th>
                  <th className="px-4 py-2.5">Traction Class</th>
                  <th className="px-4 py-2.5">Home Depot</th>
                  <th className="px-4 py-2.5">Health State</th>
                  <th className="px-4 py-2.5">Brake Pad Wear</th>
                  <th className="px-4 py-2.5">Pantograph Wear</th>
                  <th className="px-4 py-2.5">Next Scheduled Pit Line</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {rollingStockFleet.map((loco) => (
                  <tr key={loco.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-bold text-blue-600 dark:text-blue-400">
                      {loco.id}
                    </td>
                    <td className="px-4 py-3 text-slate-800 dark:text-slate-200 font-sans text-xs">
                      {loco.type}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {loco.depot}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={loco.health} showIcon={false} className="text-[10px]" />
                    </td>
                    <td className="px-4 py-3">
                      <span className={loco.brakeWear >= 80 ? 'text-red-600 dark:text-red-400 font-bold' : 'text-slate-800 dark:text-slate-200'}>
                        {loco.brakeWear}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={loco.pantographWear >= 80 ? 'text-red-600 dark:text-red-400 font-bold' : 'text-slate-800 dark:text-slate-200'}>
                        {loco.pantographWear}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-[11px]">
                      {loco.nextPit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
