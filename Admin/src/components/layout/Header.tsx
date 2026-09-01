import { useState, useEffect } from 'react';
import { useUIStore } from '@/store/uiStore';
import { useQuery } from '@tanstack/react-query';
import { railwayApi } from '@/services/api';
import {
  Menu,
  Activity,
  Search,
  Sun,
  Moon,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  const {
    toggleSidebar,
    activeCorridorFilter,
    setActiveCorridorFilter,
    activeZone,
    setActiveZone,
    theme,
    toggleTheme,
    setGlobalSearchOpen,
  } = useUIStore();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [latency] = useState<number>(34);
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const [readNotifs, setReadNotifs] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('railsetu_read_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Live IST Clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' IST'
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const { data: corridors = [] } = useQuery({
    queryKey: ['corridors'],
    queryFn: railwayApi.getCorridors,
  });

  const { data: zones = [] } = useQuery({
    queryKey: ['zones'],
    queryFn: railwayApi.getZoneDivisions,
  });

  const sampleNotifs = [
    {
      id: 'N1',
      type: 'CRITICAL',
      title: 'Ultrasonic Anomaly Detected',
      desc: 'Corridor C12 KM 104 reported micro-fissure > 4mm.',
      time: '3 min ago',
    },
    {
      id: 'N2',
      type: 'WARNING',
      title: 'Pantograph Carbon Wear High',
      desc: 'Loco #WAP7-30291 reached 82% strip wear limit.',
      time: '12 min ago',
    },
    {
      id: 'N3',
      type: 'INFO',
      title: 'Coordinated Block Scheduled',
      desc: 'Block BLK-903 approved for tonight 23:30 - 02:30 IST.',
      time: '28 min ago',
    },
  ];

  const unreadCount = sampleNotifs.filter((n) => !readNotifs.includes(n.id)).length;

  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-md px-3 sm:px-5 flex items-center justify-between select-none z-30 shrink-0 sticky top-0 transition-colors">
      {/* Left section: Sidebar toggle & Title & Search Trigger */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          title="Toggle Navigation"
        >
          <Menu className="h-4 w-4" />
        </Button>

        {/* Global Search Bar (Trigger) */}
        <button
          type="button"
          onClick={() => setGlobalSearchOpen(true)}
          className="flex items-center gap-2 h-8 px-2.5 rounded bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-blue-500/60 dark:hover:border-blue-500/60 transition-all text-xs font-sans group max-w-[280px] sm:w-64"
        >
          <Search className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-500" />
          <span className="truncate">Search Train, Sector, WO#...</span>
          <kbd className="ml-auto text-[10px] font-mono font-bold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 hidden sm:inline-block">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Center: Division/Zone & Corridor Selectors */}
      <div className="hidden md:flex items-center gap-3">
        {/* Zone Selector */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/80 px-2 py-1 rounded border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400">
            ZONE:
          </span>
          <select
            value={activeZone}
            onChange={(e) => setActiveZone(e.target.value)}
            className="bg-transparent text-slate-800 dark:text-slate-200 text-xs font-mono font-bold focus:outline-none cursor-pointer"
          >
            {zones.map((z) => (
              <option key={z.id} value={z.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                {z.code} - {z.name}
              </option>
            ))}
          </select>
        </div>

        {/* Corridor Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/80 px-2 py-1 rounded border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400">
            SECTOR:
          </span>
          <select
            value={activeCorridorFilter}
            onChange={(e) => setActiveCorridorFilter(e.target.value)}
            className="bg-transparent text-slate-800 dark:text-slate-200 text-xs font-mono font-bold focus:outline-none cursor-pointer max-w-[200px] truncate"
          >
            <option value="ALL" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
              NATIONAL NETWORK (ALL)
            </option>
            {corridors.map((c) => (
              <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                [{c.id}] {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: Telemetry, Theme Toggle & Notification Center */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Pulsing "System Status: Operational" Indicator */}
        <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 px-2 py-1 rounded text-[11px] font-mono">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-emerald-700 dark:text-emerald-400 font-bold hidden sm:inline">
            OPERATIONAL
          </span>
          <span className="text-slate-400 hidden xl:inline">|</span>
          <span className="text-slate-500 dark:text-slate-400 hidden xl:inline">{latency}ms</span>
        </div>

        {/* Live Clock */}
        <div className="hidden lg:flex items-center gap-1.5 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 px-2 py-1 rounded text-[11px] font-mono">
          <Activity className="h-3 w-3 text-blue-500 shrink-0" />
          <span className="font-semibold">{currentTime || '00:00:00 IST'}</span>
        </div>

        {/* Theme Toggle Button (Sun / Moon) */}
        <button
          type="button"
          onClick={toggleTheme}
          className="h-8 w-8 rounded flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all hover:scale-105"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-slate-700" />
          )}
        </button>

        {/* Notification Center */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative h-8 w-8 rounded flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all"
            title="Notification Center"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white font-mono text-[9px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown Panel */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-lg bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden font-sans">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    OPERATIONAL NOTIFICATIONS
                  </span>
                  <span className="text-[10px] font-mono bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-1.5 py-0.2 rounded">
                    {unreadCount} NEW
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const allReadIds = sampleNotifs.map((n) => n.id);
                    setReadNotifs(allReadIds);
                    localStorage.setItem(
                      'railsetu_read_notifications',
                      JSON.stringify(allReadIds)
                    );
                  }}
                  className="text-[10px] font-mono text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Mark all read
                </button>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
                {sampleNotifs
                  .filter((n) => !readNotifs.includes(n.id))
                  .map((n) => (
                    <div
                      key={n.id}
                      className="p-3 transition-colors bg-blue-50/40 dark:bg-blue-950/20"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${n.type === 'CRITICAL'
                              ? 'bg-red-500 animate-pulse'
                              : n.type === 'WARNING'
                                ? 'bg-amber-500'
                                : 'bg-blue-500'
                              }`}
                          />
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {n.title}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          {n.time}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {n.desc}
                      </p>
                    </div>
                  ))}
              </div>

              <div className="p-2 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-center">
                <button
                  type="button"
                  onClick={() => setIsNotifOpen(false)}
                  className="text-xs font-mono text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  Close Panel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
