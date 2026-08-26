import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { EmergencySOSModal } from '@/components/modals/EmergencySOSModal';
import { DispatchCrewModal } from '@/components/modals/DispatchCrewModal';
import { GlobalSearchModal } from '@/components/modals/GlobalSearchModal';
import { WorkOrderDetailModal } from '@/components/modals/WorkOrderDetailModal';

export function AppLayout() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 font-sans transition-colors">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header />

        {/* Dynamic Page Outlet with custom scrollbar */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-5 bg-slate-100/60 dark:bg-[#0B0F19]">
          <Outlet />
        </main>
      </div>

      {/* Global Interactive Overlays */}
      <EmergencySOSModal />
      <DispatchCrewModal />
      <GlobalSearchModal />
      <WorkOrderDetailModal />
    </div>
  );
}
