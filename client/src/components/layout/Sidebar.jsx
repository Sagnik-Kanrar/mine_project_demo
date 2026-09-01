import React from 'react';
import { useMine } from '../../context/MineContext';
import {
  LayoutDashboard,
  Map,
  Radio,
  BrainCircuit,
  HardHat,
  Compass,
  Bell,
  BarChart3,
  Layers,
  Settings,
  AlertOctagon,
  Shield,
  RadioTower,
} from 'lucide-react';

export const Sidebar = ({ isOpen, onCloseMobile }) => {
  const {
    activePage,
    setActivePage,
    alerts,
    simulationState,
    toggleEmergency,
    isConnected,
  } = useMine();

  const unresolvedAlertCount = alerts.filter((a) => !a.resolved).length;
  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL' && !a.resolved).length;

  const navItems = [
    { id: 'dashboard', label: 'Main Dashboard', icon: LayoutDashboard },
    { id: 'map', label: 'Live Mine Map', icon: Map },
    { id: 'sensors', label: 'Sensor Monitoring', icon: Radio, badge: '24 Nodes' },
    { id: 'ai-prediction', label: 'AI Subsidence Model', icon: BrainCircuit, badge: 'ML' },
    { id: 'workers', label: 'Worker Tracking (UPS)', icon: HardHat, badge: '8 Tagged' },
    { id: 'evacuation', label: 'Emergency Evacuation', icon: Compass },
    {
      id: 'alerts',
      label: 'Alerts & Incidents',
      icon: Bell,
      badge: unresolvedAlertCount > 0 ? unresolvedAlertCount : undefined,
      badgeVariant: criticalCount > 0 ? 'danger' : 'warning',
    },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
    { id: 'zones', label: 'Mine Zone Management', icon: Layers },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-mine-border bg-[#0B101D] transition-transform duration-300 lg:static lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Brand Header */}
      <div className="flex flex-col border-b border-mine-border/80 px-6 py-5 bg-mine-dark">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-950">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-mono text-lg font-black tracking-wider text-white">MINEGUARD</h1>
              <span className="font-mono text-xs font-black bg-cyan-500 text-black px-1.5 py-0.2 rounded font-bold">
                AI
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400">Mine Safety & Safe Evacuation</p>
          </div>
        </div>

        {/* Live Status Pill */}
        <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-900/90 px-3 py-1.5 border border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                simulationState.emergencyModeActive
                  ? 'bg-red-500 animate-ping shadow-[0_0_8px_#ef4444]'
                  : 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]'
              }`}
            />
            <span
              className={
                simulationState.emergencyModeActive
                  ? 'font-black text-red-400'
                  : 'font-semibold text-emerald-400'
              }
            >
              {simulationState.emergencyModeActive ? '● EMERGENCY' : '● MONITORING'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400">
            {isConnected ? 'ONLINE' : 'SYNCING'}
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                setActivePage(item.id);
                onCloseMobile?.();
              }}
              className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-950/80 to-slate-900 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-4 w-4 transition-colors ${
                    isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                />
                <span className="tracking-wide">{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`font-mono text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    item.badgeVariant === 'danger'
                      ? 'bg-red-950 text-red-300 border border-red-500/50 animate-pulse'
                      : item.badgeVariant === 'warning'
                      ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Emergency Mode Button & System Status Footer */}
      <div className="border-t border-mine-border/80 bg-mine-dark p-4 space-y-3">
        <button
          onClick={toggleEmergency}
          className={`w-full flex items-center justify-center gap-2 rounded-xl p-3 font-mono text-xs font-black uppercase tracking-wider text-white shadow-xl transition-all ${
            simulationState.emergencyModeActive
              ? 'bg-red-600 hover:bg-red-700 animate-pulse shadow-red-950'
              : 'bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 shadow-red-950/60'
          }`}
        >
          <AlertOctagon className="h-4 w-4 animate-bounce" />
          {simulationState.emergencyModeActive ? 'Emergency Mode Active' : 'Emergency Mode (HUD)'}
        </button>

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-800">
          <div className="flex items-center gap-1.5">
            <RadioTower className="h-3.5 w-3.5 text-cyan-500" />
            <span>SIH 2024 Prototype</span>
          </div>
          <span>v1.0.0</span>
        </div>
      </div>
    </aside>
  );
};
