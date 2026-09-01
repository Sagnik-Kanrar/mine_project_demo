import React, { useState } from 'react';
import { useMine } from '../context/MineContext';
import { MineMapCanvas } from '../components/map/MineMapCanvas';
import { RiskBadge } from '../components/common/RiskBadge';
import {
  HardHat,
  Layers,
  Compass,
  DoorOpen,
} from 'lucide-react';

export const LiveMapPage = () => {
  const {
    nodes,
    tunnels,
    sensors,
    workers,
    activeRouteWorkerId,
    setActiveRouteWorkerId,
    activeRoutePlan,
    selectedTunnel,
    setSelectedTunnel,
    selectedWorker,
    setSelectedWorker,
    selectedSensor,
    setSelectedSensor,
    selectedZoneFilter,
  } = useMine();

  const [activeTab, setActiveTab] = useState('workers');

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-mono text-2xl font-black tracking-tight text-white">LIVE 2D MINE MAP</h1>
            <span className="font-mono text-xs bg-cyan-950 text-cyan-300 px-2.5 py-0.5 rounded border border-cyan-500/40 font-bold">
              BORD & PILLAR / LONGWALL TOPOLOGY
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Vector Strata Visualization, Real-Time Worker UPS Telemetry & Hazard Avoidance Vectors
          </p>
        </div>

        {/* Active Evacuation Path Alert */}
        {activeRoutePlan && (
          <div className="flex items-center gap-3 bg-cyan-950/90 border border-cyan-500/50 px-4 py-2 rounded-xl text-xs font-mono text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <Compass className="h-4 w-4 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
            <div>
              <span>Routing for: <strong className="text-white">{activeRoutePlan.workerName}</strong></span>
              <span className="block text-[11px] text-cyan-300">
                Safe Exit: <strong className="text-white">{activeRoutePlan.destinationExit}</strong> ({activeRoutePlan.totalDistanceMeters}m • ~{Math.round((activeRoutePlan.estimatedTimeSeconds || 0) / 60)} min)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Layout: Map Canvas + Interactive Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left 3 Columns: Vector Mine Map */}
        <div className="lg:col-span-3">
          <MineMapCanvas
            nodes={nodes}
            tunnels={tunnels}
            sensors={sensors}
            workers={workers}
            activeRoutePlan={activeRoutePlan}
            selectedTunnel={selectedTunnel}
            selectedWorker={selectedWorker}
            selectedSensor={selectedSensor}
            onSelectTunnel={setSelectedTunnel}
            onSelectWorker={(w) => {
              setSelectedWorker(w);
              setActiveRouteWorkerId(w.id);
            }}
            onSelectSensor={setSelectedSensor}
            zoneFilter={selectedZoneFilter}
            height={620}
          />
        </div>

        {/* Right 1 Column: Interactive Selector & Inspector Tabs */}
        <div className="space-y-4">
          <div className="rounded-xl border border-mine-border bg-mine-card/90 p-4 shadow-xl space-y-3">
            {/* Tabs */}
            <div className="flex rounded-lg bg-slate-900/90 p-1 border border-slate-800 text-xs font-mono">
              <button
                onClick={() => setActiveTab('workers')}
                className={`flex-1 py-1.5 rounded-md font-bold transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'workers' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <HardHat className="h-3.5 w-3.5" />
                Miners ({workers.length})
              </button>

              <button
                onClick={() => setActiveTab('tunnels')}
                className={`flex-1 py-1.5 rounded-md font-bold transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'tunnels' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                Tunnels ({tunnels.length})
              </button>

              <button
                onClick={() => setActiveTab('exits')}
                className={`flex-1 py-1.5 rounded-md font-bold transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'exits' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <DoorOpen className="h-3.5 w-3.5" />
                Exits (4)
              </button>
            </div>

            {/* Tab 1: Miners List */}
            {activeTab === 'workers' && (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                <p className="text-[11px] text-slate-400 font-mono">
                  Select a worker to display their live dynamic safe evacuation route:
                </p>
                {workers.map((w) => {
                  const isSelected = activeRouteWorkerId === w.id;
                  return (
                    <div
                      key={w.id}
                      onClick={() => {
                        setActiveRouteWorkerId(w.id);
                        setSelectedWorker(w);
                      }}
                      className={`rounded-xl p-3 border transition cursor-pointer font-mono text-xs ${
                        isSelected
                          ? 'bg-cyan-950/80 border-cyan-500 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                          : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className={`h-2 w-2 rounded-full ${w.status === 'SAFE' ? 'bg-emerald-400' : 'bg-red-500 animate-ping'}`} />
                          <strong className="text-sm">{w.name}</strong>
                        </div>
                        <span className="text-[10px] text-slate-400">{w.id}</span>
                      </div>

                      <div className="mt-1.5 grid grid-cols-2 gap-1 text-[11px] text-slate-400">
                        <div>Zone: <span className="text-slate-200">{w.zone}</span></div>
                        <div>Nearest: <span className="text-emerald-400 font-bold">{w.assignedExitId}</span></div>
                        <div>Distance: <span className="text-cyan-300">{w.distanceToExit}m</span></div>
                        <div>Heart Rate: <span className="text-rose-300">{w.heartRateBpm} bpm</span></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tab 2: Tunnels List */}
            {activeTab === 'tunnels' && (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                <p className="text-[11px] text-slate-400 font-mono">
                  Select a tunnel section to inspect structural strata deformation:
                </p>
                {tunnels.map((t) => {
                  const isSelected = selectedTunnel?.id === t.id;
                  const isCollapsed = t.status === 'COLLAPSED';

                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTunnel(t)}
                      className={`rounded-xl p-3 border transition cursor-pointer font-mono text-xs ${
                        isSelected
                          ? 'bg-slate-800 border-cyan-500 text-white'
                          : isCollapsed
                          ? 'bg-red-950/60 border-red-500 text-red-200 animate-pulse'
                          : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-sm">{t.id}</strong>
                        <RiskBadge level={t.riskLevel} size="sm" />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">{t.name}</p>

                      <div className="mt-1.5 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Length: {t.distance}m</span>
                        <span className="text-cyan-300 font-bold">Deform: {(t.deformationMm || 0).toFixed(1)}mm</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tab 3: Surface Exits List */}
            {activeTab === 'exits' && (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {nodes.filter((n) => n.isExit || n.type === 'REFUGE_BAY').map((n) => (
                  <div
                    key={n.id}
                    className="rounded-xl bg-slate-900/80 p-3 border border-slate-800 font-mono text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{n.isExit ? '🚪' : '🛡️'}</span>
                        <strong className="text-white">{n.id}</strong>
                      </div>
                      <span className="text-emerald-400 font-bold text-[10px] bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                        {n.isOpen ? 'OPERATIONAL' : 'RESTRICTED'}
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs">{n.name}</p>
                    <div className="text-[11px] text-slate-500">Zone: {n.zone} • Elevation: {n.elevation}m</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
