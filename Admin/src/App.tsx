import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { OverviewPage } from './pages/OverviewPage';
import { TrackHealthPage } from './pages/TrackHealthPage';
import { FleetDepotPage } from './pages/FleetDepotPage';
import { LiveReportsPage } from './pages/LiveReportsPage';
import { WorkOrdersPage } from './pages/WorkOrdersPage';
import { CoordinationPage } from './pages/CoordinationPage';
import { BlockPlanningPage } from './pages/BlockPlanningPage';
import { CrewDispatchPage } from './pages/CrewDispatchPage';
import { SensorDiagnosticsPage } from './pages/SensorDiagnosticsPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/track-health" element={<TrackHealthPage />} />
        <Route path="/reports" element={<LiveReportsPage />} />
        <Route path="/work-orders" element={<WorkOrdersPage />} />
        <Route path="/coordination" element={<CoordinationPage />} />
        <Route path="/blocks" element={<BlockPlanningPage />} />
        <Route path="/crew-dispatch" element={<CrewDispatchPage />} />
        <Route path="/sensor-diagnostics" element={<SensorDiagnosticsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
