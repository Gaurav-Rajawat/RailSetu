
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/StatusBadge';
import {
  Cpu,
  Flame,
  Volume2,
} from 'lucide-react';

export function SensorDiagnosticsPage() {
  const sensorDevices = [
    { id: 'HABD-C12-01', name: 'Hot Axle Box Detector (Infrared)', location: 'Delhi–Kanpur KM 82', status: 'HEALTHY', lastPing: '2s ago', reading: '54°C (Nominal)' },
    { id: 'WILD-C04-03', name: 'Wheel Impact Load Detector', location: 'Mumbai–Surat KM 144', status: 'WARNING', lastPing: '5s ago', reading: '31.2 Tons Peak (Caution)' },
    { id: 'OHE-TENS-C12-09', name: 'Traction Catenary Tension Transducer', location: 'Aligarh Jn Mast 42', status: 'HEALTHY', lastPing: '1s ago', reading: '12.4 kN Normal' },
    { id: 'ACOUSTIC-C19-02', name: 'Acoustic Bearing Defect Sensor', location: 'Arakkonam Yard Point 2', status: 'HEALTHY', lastPing: '4s ago', reading: '44 dB Quiet' },
    { id: 'OPT-USFD-C08-01', name: 'Optical Rail Profile & Gap Scanner', location: 'Howrah Approach KM 12', status: 'HEALTHY', lastPing: '1s ago', reading: '0.2mm Gap' },
    { id: 'POINT-MOTOR-C23-04', name: 'Point Machine Current Signature Sensor', location: 'Nagpur East Switch 11', status: 'HEALTHY', lastPing: '3s ago', reading: '3.8 A Stroke Peak' },
  ];

  return (
    <div className="space-y-4 max-w-[1680px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3.5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-base sm:text-lg font-black tracking-wider uppercase text-slate-900 dark:text-slate-100 font-mono">
              Trackside IoT Sensor Telemetry & Diagnostics
            </h1>
            <span className="text-[10px] bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded font-mono font-bold border border-purple-200 dark:border-purple-800">
              SCADA EDGE SENSORS
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
            Real-time trackside edge telemetry: Hot Axle Box Detectors (HABD), WILD impact arrays, and catenary tension sensors
          </p>
        </div>
      </div>

      {/* Sensor Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-800 dark:text-slate-200">
              <Cpu className="h-4 w-4 text-purple-500" />
              Connected Edge Sensors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-mono font-black text-slate-900 dark:text-slate-100">
              1,248 Active
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-mono mt-1 font-semibold">
              99.8% Online Network Uptime
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-800 dark:text-slate-200">
              <Flame className="h-4 w-4 text-orange-500" />
              HABD Thermal Readings (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-mono font-black text-slate-900 dark:text-slate-100">
              0 Overheated
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
              Max axle temp logged: 58°C (Nominal &lt; 75°C)
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-800 dark:text-slate-200">
              <Volume2 className="h-4 w-4 text-blue-500" />
              Acoustic Flaw Triggers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-mono font-black text-slate-900 dark:text-slate-100">
              2 Anomalies
            </div>
            <div className="text-xs text-amber-600 dark:text-amber-400 font-mono mt-1 font-semibold">
              Auto-dispatched to triage queue
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sensor Table */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-slate-900 dark:text-slate-100">
            Trackside Telemetry Nodes Status
          </CardTitle>
          <CardDescription>
            Live stream from wayside infrared, vibration and optical sensors across the network
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-950/80 border-y border-slate-200 dark:border-slate-800 text-[10px] uppercase font-mono text-slate-500 dark:text-slate-400 font-bold select-none">
                <tr>
                  <th className="px-4 py-2.5">Sensor Unit ID</th>
                  <th className="px-4 py-2.5">Sensor Device Type</th>
                  <th className="px-4 py-2.5">Track Location</th>
                  <th className="px-4 py-2.5">Device Health</th>
                  <th className="px-4 py-2.5">Live Telemetry Reading</th>
                  <th className="px-4 py-2.5">Last Heartbeat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {sensorDevices.map((sensor) => (
                  <tr key={sensor.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-bold text-purple-600 dark:text-purple-400">
                      {sensor.id}
                    </td>
                    <td className="px-4 py-3 text-slate-800 dark:text-slate-200 font-sans text-xs">
                      {sensor.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {sensor.location}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={sensor.status} showIcon={false} className="text-[10px]" />
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-100">
                      {sensor.reading}
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-[11px]">
                      {sensor.lastPing}
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
