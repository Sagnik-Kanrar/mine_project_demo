import React from 'react';
import { useMine } from '../context/MineContext';
import {
  HardHat,
  Heart,
  Battery,
  DoorOpen,
  Compass,
  AlertTriangle,
  Info,
} from 'lucide-react';

export const WorkerTrackingPage = () => {
  const {
    workers = [],
    setSelectedWorker,
    setActiveRouteWorkerId,
    setActivePage,
    runScenarioWorkerSOS,
    selectedZoneFilter,
  } = useMine();

  const filteredWorkers = workers.filter(
    (w) => selectedZoneFilter === 'ALL' || w.zone === selectedZoneFilter
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Positioning Architecture Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-mono text-2xl font-black tracking-tight text-white">
              UNDERGROUND POSITIONING SYSTEM (UPS)
            </h1>
            <span className="font-mono text-xs bg-cyan-950 text-cyan-300 px-2.5 py-0.5 rounded border border-cyan-500/40 font-bold">
              UWB / BLE / IMU DEAD RECKONING
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Non-GPS Subsurface Localization: Triangulation via Tunnel Anchors & Helmet Inertial Sensors
          </p>
        </div>

        {/* SOS Emergency Trigger */}
        <button
          onClick={runScenarioWorkerSOS}
          className="flex items-center gap-1.5 rounded-xl bg-purple-950/90 border border-purple-500/50 hover:bg-purple-900 text-purple-200 px-4 py-2 text-xs font-mono font-bold transition shadow-lg"
        >
          <AlertTriangle className="h-4 w-4 text-purple-400" />
          Simulate Miner SOS Beacon (W-003)
        </button>
      </div>

      {/* Technology Explanation Card */}
      <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4 text-xs font-mono space-y-2 text-slate-300">
        <div className="flex items-center gap-2 font-bold text-cyan-300">
          <Info className="h-4 w-4 text-cyan-400" />
          <span>Why Underground Positioning System (UPS) Instead of Conventional GPS?</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-300">
          Satellite GPS RF signals cannot penetrate hundreds of meters of solid sandstone and coal overburden. MINEGUARD AI utilizes low-power <strong>UWB (Ultra-Wideband) Time-of-Flight Anchors</strong> positioned at tunnel crosscuts, combined with <strong>BLE Mesh Beacons</strong> and <strong>Helmet IMU Dead-Reckoning</strong> to track miners within ±0.5m accuracy.
        </p>
      </div>

      {/* Workers Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredWorkers.map((worker) => {
          const isEvacuating = worker.status === 'EVACUATING';
          const isTrapped = worker.status === 'TRAPPED';

          return (
            <div
              key={worker.id}
              onClick={() => setSelectedWorker(worker)}
              className={`rounded-xl border p-4 shadow-xl cursor-pointer transition-all hover:scale-[1.01] space-y-3 font-mono text-xs ${
                isTrapped
                  ? 'bg-red-950/40 border-red-500 shadow-red-950 animate-pulse'
                  : isEvacuating
                  ? 'bg-amber-950/30 border-amber-500/50'
                  : 'bg-mine-card/90 border-mine-border hover:border-cyan-500/50'
              }`}
            >
              {/* Top Row: Avatar & Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`rounded-xl p-2.5 ${
                      isTrapped
                        ? 'bg-red-900/80 text-white'
                        : isEvacuating
                        ? 'bg-amber-900/80 text-amber-200'
                        : 'bg-slate-800 text-cyan-400'
                    }`}
                  >
                    <HardHat className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{worker.name}</h3>
                    <span className="text-[10px] text-slate-400">{worker.id} • {worker.role}</span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                    isTrapped
                      ? 'bg-red-950 text-red-300 border-red-500/60 animate-ping'
                      : isEvacuating
                      ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                      : 'bg-emerald-950 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  {worker.status}
                </span>
              </div>

              {/* Subsurface Coordinates Box */}
              <div className="rounded-lg bg-mine-darkest p-3 border border-slate-800/80 space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">UPS Method:</span>
                  <strong className="text-cyan-300">{worker.positioningMethod}</strong>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Zone / Tunnel:</span>
                  <span className="text-slate-300">{worker.zone} ({worker.currentTunnelId})</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Subsurface Depth:</span>
                  <span className="text-slate-300">{worker.position?.elevation} m</span>
                </div>
              </div>

              {/* Nearest Exit & Route Distance */}
              <div className="rounded-lg bg-slate-900/80 p-2.5 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <DoorOpen className="h-3.5 w-3.5 text-emerald-400" />
                    Nearest Exit:
                  </span>
                  <strong className="text-emerald-400">{worker.assignedExitId}</strong>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Distance to Surface:</span>
                  <strong className="text-white">{worker.distanceToExit} meters</strong>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Est. Evac Time:</span>
                  <span className="text-cyan-300 font-bold">~{Math.round((worker.estimatedEvacTimeSeconds || 0) / 60)} min</span>
                </div>
              </div>

              {/* Biometrics & Battery Footer */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                <div className="flex items-center gap-1">
                  <Heart className="h-3.5 w-3.5 text-rose-400" />
                  <span className="text-white font-bold">{worker.heartRateBpm} BPM</span>
                </div>
                <div className="flex items-center gap-1">
                  <Battery className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{worker.batteryTag}%</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveRouteWorkerId(worker.id);
                    setActivePage('evacuation');
                  }}
                  className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-0.5"
                >
                  <Compass className="h-3 w-3" />
                  Route
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
