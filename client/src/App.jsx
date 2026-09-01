import React, { useState } from 'react';
import { MineProvider, useMine } from './context/MineContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DemoControlBar } from './components/layout/DemoControlBar';

// Modals
import { TunnelDetailModal } from './components/modals/TunnelDetailModal';
import { WorkerDetailModal } from './components/modals/WorkerDetailModal';
import { SensorDetailModal } from './components/modals/SensorDetailModal';
import { EmergencyHUDModal } from './components/modals/EmergencyHUDModal';
import { SIHDemoTourModal } from './components/modals/SIHDemoTourModal';
import { SensorSimulatorModal } from './components/modals/SensorSimulatorModal';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { LiveMapPage } from './pages/LiveMapPage';
import { SensorsPage } from './pages/SensorsPage';
import { AIPredictionPage } from './pages/AIPredictionPage';
import { WorkerTrackingPage } from './pages/WorkerTrackingPage';
import { EmergencyEvacuationPage } from './pages/EmergencyEvacuationPage';
import { AlertsPage } from './pages/AlertsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ZonesPage } from './pages/ZonesPage';
import { SystemSettingsPage } from './pages/SystemSettingsPage';

const MainLayout = () => {
  const {
    activePage,
    selectedTunnel,
    setSelectedTunnel,
    selectedWorker,
    setSelectedWorker,
    selectedSensor,
    setSelectedSensor,
    sensors,
    setActiveRouteWorkerId,
    setActivePage,
  } = useMine();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'map':
        return <LiveMapPage />;
      case 'sensors':
        return <SensorsPage />;
      case 'ai-prediction':
        return <AIPredictionPage />;
      case 'workers':
        return <WorkerTrackingPage />;
      case 'evacuation':
        return <EmergencyEvacuationPage />;
      case 'alerts':
        return <AlertsPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'zones':
        return <ZonesPage />;
      case 'settings':
        return <SystemSettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#080C14] text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={mobileMenuOpen} onCloseMobile={() => setMobileMenuOpen(false)} />

      {/* Main Workspace Column */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <Header onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />

        {/* SIH Scenario Control Panel */}
        <DemoControlBar />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-12">
          {renderActivePage()}
        </main>
      </div>

      {/* Inspection Modals */}
      <TunnelDetailModal
        tunnel={selectedTunnel}
        sensors={sensors}
        onClose={() => setSelectedTunnel(null)}
      />

      <WorkerDetailModal
        worker={selectedWorker}
        onClose={() => setSelectedWorker(null)}
        onFocusRoute={(workerId) => {
          setActiveRouteWorkerId(workerId);
          setActivePage('map');
        }}
      />

      <SensorDetailModal
        sensor={selectedSensor}
        onClose={() => setSelectedSensor(null)}
      />

      {/* Full Screen Emergency Command Center HUD */}
      <EmergencyHUDModal />

      {/* Guided SIH Demonstration Modal */}
      <SIHDemoTourModal />

      {/* Live Telemetry Sliders Modal */}
      <SensorSimulatorModal />
    </div>
  );
};

export function App() {
  return (
    <MineProvider>
      <MainLayout />
    </MineProvider>
  );
}

export default App;
