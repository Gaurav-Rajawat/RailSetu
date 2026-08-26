import { useState } from 'react';
import { useUIStore } from '@/store/uiStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Sun,
  Moon,
  Sliders,
  Save,
  CheckCircle2,
} from 'lucide-react';

export function SettingsPage() {
  const { theme, setTheme } = useUIStore();
  const [aiThreshold, setAiThreshold] = useState<number>(85);
  const [pollInterval, setPollInterval] = useState<string>('5s');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-4 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3.5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-base sm:text-lg font-black tracking-wider uppercase text-slate-900 dark:text-slate-100 font-mono">
              System Settings & Operational Parameters
            </h1>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded font-mono font-bold border border-slate-200 dark:border-slate-700">
              CONFIG
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
            Manage theme preferences, AI triage thresholds, SCADA poll intervals, and emergency protocols
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 flex items-center gap-2.5 text-xs font-mono">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>Operational parameters updated and saved to local station configuration successfully.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Theme & Display */}
        <Card>
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sun className="h-4 w-4 text-amber-500" />
              Theme & Visual Appearance
            </CardTitle>
            <CardDescription>
              Toggle between high-contrast Dark control center mode and Light office mode
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-3 rounded-lg border text-left flex items-center gap-3 transition-all ${theme === 'dark'
                    ? 'border-blue-500 bg-slate-900 text-white ring-2 ring-blue-500/30'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                  }`}
              >
                <Moon className="h-5 w-5 text-blue-400" />
                <div>
                  <div className="text-xs font-bold font-mono">Dark Control Mode</div>
                  <div className="text-[10px] text-slate-400">#0B0F19 background</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-3 rounded-lg border text-left flex items-center gap-3 transition-all ${theme === 'light'
                    ? 'border-blue-500 bg-blue-50 text-slate-900 ring-2 ring-blue-500/30'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                  }`}
              >
                <Sun className="h-5 w-5 text-amber-500" />
                <div>
                  <div className="text-xs font-bold font-mono">Light Clean Mode</div>
                  <div className="text-[10px] text-slate-500">#F8FAFC background</div>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* AI & Telemetry Thresholds */}
        <Card>
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sliders className="h-4 w-4 text-blue-500" />
              AI Computer Vision & Defect Triage
            </CardTitle>
            <CardDescription>
              Configure automated confidence gates for defect scoring
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-600 dark:text-slate-400">AI Confidence Cutoff for Critical:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{aiThreshold}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                step="5"
                value={aiThreshold}
                onChange={(e) => setAiThreshold(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
                SCADA Sensor Telemetry Poll Interval:
              </label>
              <select
                value={pollInterval}
                onChange={(e) => setPollInterval(e.target.value)}
                className="w-full h-8 px-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 focus:outline-none"
              >
                <option value="1s">1 Second (High Bandwidth / Testing)</option>
                <option value="5s">5 Seconds (Standard Operations)</option>
                <option value="15s">15 Seconds (Consolidated SCADA)</option>
                <option value="30s">30 Seconds (Low Latency Satellite)</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <Button variant="primary" size="default" onClick={handleSave} className="gap-2 font-mono">
          <Save className="h-4 w-4" />
          Save Configuration
        </Button>
      </div>
    </div>
  );
}
