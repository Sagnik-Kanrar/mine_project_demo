import React, { useState } from 'react';
import { useMine } from '../context/MineContext';
import { MineMapCanvas } from '../components/map/MineMapCanvas';
import { RiskBadge } from '../components/common/RiskBadge';
import {
  Compass,
  ShieldAlert,
  ArrowRight,
  Flame,
  RotateCcw,
  GitFork,
} from 'lucide-react';

export const EmergencyEvacuationPage = () => {
  const {
    workers = [],
    nodes = [],
    tunnels = [],
    sensors = [],
    activeRouteWorkerId,
    setActiveRouteWorkerId,
    activeRoutePlan,
    simulationState,
    runScenarioCollapse,
    runScenarioNormal,
    fetchWorkerRoute,
  } = useMine();

  const [selectedWorkerId, setSelectedWorkerId] = useState(activeRouteWorkerId || 'W-001');

  const handleWorkerChange = (id) => {
    setSelectedWorkerId(id);
    setActiveRouteWorkerId(id);
    fetchWorkerRoute(id);
  };

  const isT07Collapsed = simulationState?.collapsedTunnelIds?.includes('T-07');

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-mono text-2xl font-black tracking-tight text-white">
              INTELLIGENT EMERGENCY EVACUATION
            </h1>
            <span className="font-mono text-xs bg-cyan-950 text-cyan-300 px-2.5 py-0.5 rounded border border-cyan-500/40 font-bold">
              SHORTEST SAFE PATH ALGORITHM
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Graph-Based Hazard Penalty Dijkstra/A* Pathfinding with Real-Time Dynamic Rerouting
          </p>
        </div>

        {/* Dynamic Reroute Test Trigger */}
        <div className="flex items-center gap-2">
          {isT07Collapsed ? (
            <button
              onClick={runScenarioNormal}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500 text-emerald-400 px-4 py-2 text-xs font-mono font-bold transition shadow-md"
            >
              <RotateCcw className="h-4 w-4" />
              Reset & Clear Blockage
            </button>
          ) : (
            <button
              onClick={runScenarioCollapse}
              className="flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-xs font-mono font-black transition shadow-lg shadow-red-950 animate-pulse"
            >
              <Flame className="h-4 w-4" />
              Simulate Collapse (T-07) & Test Reroute
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Recalculation Alert Banner */}
      {isT07Collapsed && (
        <div className="rounded-xl border-2 border-red-500 bg-red-950/80 p-4 shadow-[0_0_25px_rgba(239,68,68,0.4)] animate-fadeIn">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-red-600 p-2 text-white mt-0.5">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-mono text-sm font-black uppercase text-red-200">
                  🚨 DYNAMIC ROUTE RE-CALCULATION ACTIVE: HAZARD DETECTED
                </h3>
                <p className="text-xs font-mono text-red-300 mt-1">
                  Tunnel <strong>T-07</strong> has experienced catastrophic roof subsidence and is impassable (Cost = &infin;).
                  The routing graph automatically pruned T-07 and calculated the safest detour through <strong>Exit E1</strong>.
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs font-mono">
                  <div className="text-slate-400 line-through">
                    Old Route: W1 → J4 → T7 → T8 → EXIT E2 (BLOCKED)
                  </div>
                  <div className="text-emerald-300 font-bold flex items-center gap-1">
                    <ArrowRight className="h-3.5 w-3.5" />
                    New Safe Route: W1 → J4 → J3 → T5 → T6 → EXIT E1
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Interactive Map + Route Planner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Evacuation Route Map */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="h-4 w-4 text-cyan-400" />
              <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                Live Evacuation Route Map Visualization
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400">Target Miner:</span>
              <select
                value={selectedWorkerId}
                onChange={(e) => handleWorkerChange(e.target.value)}
                className="rounded-lg border border-mine-border bg-mine-card px-2.5 py-1 text-slate-200 font-bold cursor-pointer"
              >
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.id} - {w.zone})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <MineMapCanvas
            nodes={nodes}
            tunnels={tunnels}
            sensors={sensors}
            workers={workers}
            activeRoutePlan={activeRoutePlan}
            height={520}
          />
        </div>

        {/* Right Col: Turn-by-Turn Route Guidance Panel */}
        <div className="space-y-4">
          {activeRoutePlan ? (
            <div className="rounded-xl border border-mine-border bg-mine-card/90 p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-mine-border pb-3">
                <div>
                  <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                    Turn-By-Turn Navigation
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Smart Helmet HUD Guidance Protocol
                  </p>
                </div>
                <RiskBadge level={activeRoutePlan.overallPathRisk} size="sm" />
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="rounded-lg bg-mine-darkest p-2.5 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">TOTAL DISTANCE</span>
                  <strong className="text-white text-base">{activeRoutePlan.totalDistanceMeters}m</strong>
                </div>
                <div className="rounded-lg bg-mine-darkest p-2.5 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">ESTIMATED EVAC TIME</span>
                  <strong className="text-cyan-300 text-base">
                    {Math.floor((activeRoutePlan.estimatedTimeSeconds || 0) / 60)}m {(activeRoutePlan.estimatedTimeSeconds || 0) % 60}s
                  </strong>
                </div>
              </div>

              {/* Step by Step List */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {activeRoutePlan.turnByTurn?.map((step) => (
                  <div
                    key={step.step}
                    className="rounded-lg bg-slate-900/90 p-3 border border-slate-800 space-y-1 font-mono text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-cyan-400">Step {step.step}</span>
                      <span className="text-[10px] text-slate-500">{step.distanceM}m segment</span>
                    </div>
                    <p className="text-slate-200 text-xs font-sans leading-snug">{step.instruction}</p>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400 text-center">
                Calculated at: {new Date(activeRoutePlan.calculatedAt).toLocaleTimeString()}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-mine-border bg-mine-card/90 p-8 text-center text-slate-500 font-mono text-xs">
              Calculating safe evacuation route...
            </div>
          )}
        </div>
      </div>

      {/* Algorithm Deep Dive: Shortest Path vs Shortest SAFE Path Comparison */}
      <div className="rounded-xl border border-mine-border bg-mine-card/90 p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-mine-border pb-3">
          <GitFork className="h-5 w-5 text-cyan-400" />
          <h2 className="font-mono text-base font-bold uppercase tracking-wider text-white">
            Shortest Safe Path Mathematical Formulation (SIH Innovation)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
          <div className="rounded-xl bg-mine-darkest p-4 border border-slate-800 space-y-2">
            <h3 className="font-bold text-amber-400 text-sm">❌ Conventional Dijkstra (Naive Shortest Path)</h3>
            <p className="text-slate-400 leading-relaxed">
              Minimizes pure Euclidean length: min &Sigma; d_i. It blindly routes workers straight through collapsing tunnel T-07 because it is 150m shorter on paper, trapping miners in rock falls.
            </p>
          </div>

          <div className="rounded-xl bg-cyan-950/20 p-4 border border-cyan-500/40 space-y-2">
            <h3 className="font-bold text-cyan-300 text-sm">✅ MINEGUARD AI (Shortest SAFE Path)</h3>
            <p className="text-slate-300 leading-relaxed">
              Dynamic Cost: Cost(e) = Distance(e) &times; W_Risk(e). Where W(Safe) = 1.0, W(Caution) = 2.5, W(Warning) = 7.0, and W(Critical) = &infin;. High-risk sections receive infinite penalties and are safely avoided.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
