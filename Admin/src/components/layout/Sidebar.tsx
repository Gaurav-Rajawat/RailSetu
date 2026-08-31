import { NavLink } from 'react-router-dom';
import { useUIStore } from '@/store/uiStore';
import { useQuery } from '@tanstack/react-query';
import { railwayApi } from '@/services/api';
import {
  LayoutDashboard,

  Train,
  FileWarning,
  Wrench,
  Users,
  Cpu,
  Settings,
  AlertOctagon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, setEmergencyModalOpen } = useUIStore();

  const { data: stats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: railwayApi.getDashboardStats,
  });

  const { data: workOrders = [] } = useQuery({
    queryKey: ['workOrders'],
    queryFn: () => railwayApi.getWorkOrders(),
  });

  const activeWorkOrdersCount = workOrders.filter(
    (w) => w.status === 'IN_PROGRESS' || w.status === 'DISPATCHED'
  ).length;

  const navItems = [
    {
      name: 'Overview',
      path: '/',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: 'Live Faults',
      path: '/reports',
      icon: FileWarning,
      badge: stats?.criticalReportsOpen ? (
        <span className="ml-auto bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 text-[10px] font-mono px-1.5 py-0.2 rounded font-bold animate-pulse">
          {stats.criticalReportsOpen} CRIT
        </span>
      ) : null,
    },
    {
      name: 'Work Orders',
      path: '/work-orders',
      icon: Wrench,
      badge: activeWorkOrdersCount > 0 ? (
        <span className="ml-auto bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-mono px-1.5 py-0.2 rounded font-bold">
          {activeWorkOrdersCount} ACT
        </span>
      ) : null,
    },
    {
      name: 'Crew Dispatch',
      path: '/crew-dispatch',
      icon: Users,
      badge: null,
    },
    {
      name: 'Sensor Diagnostics',
      path: '/sensor-diagnostics',
      icon: Cpu,
      badge: null,
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside
      className={cn(
        'border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F19] transition-all duration-200 flex flex-col z-20 shrink-0 select-none justify-between h-screen',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand Bar */}
        <div className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center px-3.5 gap-3 overflow-hidden bg-slate-50/50 dark:bg-slate-950/40">
          <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-lg shadow-sm shadow-blue-500/20 shrink-0 flex items-center justify-center">
            <Train className="h-4 w-4" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col truncate">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black font-mono tracking-wider text-slate-900 dark:text-slate-100 uppercase">
                  RailOps Control
                </span>
                <span className="text-[9px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 px-1 rounded font-mono font-bold">
                  v2.4
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">
                RAILWAY BOARD &bull; HQ-NDLS
              </span>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <div className="p-2.5 space-y-6 overflow-y-auto flex-1">
          <div>
            {!sidebarCollapsed && (
              <div className="px-2.5 pb-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                Command Modules
              </div>
            )}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border',
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/80 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      )
                    }
                    title={sidebarCollapsed ? item.name : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!sidebarCollapsed && (
                      <>
                        <span className="truncate">{item.name}</span>
                        {item.badge}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Emergency SOS Trigger Button */}
        <div className="p-2.5 border-t border-slate-200 dark:border-slate-800/80">
          <button
            type="button"
            onClick={() => setEmergencyModalOpen(true)}
            className={cn(
              'w-full py-2 px-2.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm shadow-red-600/30 hover:from-red-500 hover:to-rose-500 transition-all active:scale-[0.98]',
              sidebarCollapsed && 'px-0'
            )}
            title="Emergency SOS Override"
          >
            <AlertOctagon className="h-4 w-4 shrink-0 animate-pulse" />
            {!sidebarCollapsed && <span>EMERGENCY SOS</span>}
          </button>
        </div>

        {/* User Profile Card */}
        {!sidebarCollapsed && (
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="h-8 w-8 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-800 dark:text-slate-200 border border-slate-400 dark:border-slate-600">
                  SS
                </div>
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0B0F19]" />
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  S. Sharma (IRSE)
                </span>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">
                  Chief Operations Controller
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Collapse Toggle Footer */}
        <div className="p-2 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={toggleSidebar}
            className="w-full h-7 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded text-xs font-mono transition-colors"
            title={sidebarCollapsed ? 'Expand Navigation' : 'Collapse Navigation'}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <div className="flex items-center gap-1.5">
                <ChevronLeft className="h-3.5 w-3.5" />
                <span className="text-[10px] uppercase font-bold tracking-wider">COLLAPSE SIDEBAR</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
