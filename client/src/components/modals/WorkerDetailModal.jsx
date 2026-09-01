import React from 'react';
import { X, HardHat, Heart, Battery, Radio, Compass, Navigation } from 'lucide-react';

export const WorkerDetailModal = ({ worker, onClose, onFocusRoute }) => {
  if (!worker) return null;

  const isEvacuating = worker.status === 'EVACUATING';
  const isTrapped = worker.status === 'TRAPPED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-mine-border bg-mine-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-mine-border/80 bg-slate-900/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-950/80 border border-amber-500/40 p-2 text-amber-400">
              <HardHat className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-lg font-black text-white">{worker.name}</h3>
                <span className="text-xs font-mono text-slate-400 font-bold bg-slate-800 px-2 py-0.5 rounded">
                  {worker.id}
                </span>
              </div>
              <p className="text-xs text-slate-400">{worker.role} • {worker.zone}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 p-6 text-sm">
          {/* Status Bar */}
          <div className="flex items-center justify-between rounded-xl border border-mine-border/80 bg-slate-900/60 p-3">
            <span className="text-xs font-semibold text-slate-400">Operational Safety Status:</span>
            <span
              className={`font-mono text-xs font-bold px-2.5 py-1 rounded-full border ${
                isTrapped
                  ? 'bg-red-950/80 text-red-400 border-red-500/60 animate-pulse'
                  : isEvacuating
                  ? 'bg-amber-950/80 text-amber-400 border-amber-500/60 animate-pulse'
                  : 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40'
              }`}
            >
              {worker.status}
            </span>
          </div>

          {/* UPS Positioning Details */}
          <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-300">
              <Radio className="h-4 w-4 text-cyan-400" />
              <span>Underground Positioning System (UPS)</span>
            </div>
            <p className="text-xs text-slate-300">
              Localized via <strong className="text-cyan-300">{worker.positioningMethod} Anchors</strong> & Helmet IMU Dead Reckoning (No GPS).
            </p>
            <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-xs text-slate-300">
              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <span className="text-slate-500 text-[10px] block">X COORD</span>
                {worker.position?.x} m
              </div>
              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <span className="text-slate-500 text-[10px] block">Y COORD</span>
                {worker.position?.y} m
              </div>
              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <span className="text-slate-500 text-[10px] block">SEAM DEPTH</span>
                {worker.position?.elevation} m
              </div>
            </div>
          </div>

          {/* Vitals & Tag Telemetry */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-mine-border/80 bg-slate-900/60 p-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Heart className="h-3.5 w-3.5 text-rose-400 animate-pulse" />
                <span>Biometric Heart Rate</span>
              </div>
              <p className="font-mono text-xl font-black text-white">{worker.heartRateBpm} BPM</p>
              <p className="text-[11px] text-slate-500 font-mono">Normal Range: 60-100</p>
            </div>

            <div className="rounded-xl border border-mine-border/80 bg-slate-900/60 p-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Battery className="h-3.5 w-3.5 text-emerald-400" />
                <span>Smart Tag Battery</span>
              </div>
              <p className="font-mono text-xl font-black text-white">{worker.batteryTag}%</p>
              <p className="text-[11px] text-slate-500 font-mono">Estimated ~48h runtime</p>
            </div>
          </div>

          {/* Evacuation Route Summary */}
          <div className="rounded-xl border border-mine-border/80 bg-slate-900/60 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-bold text-white">Shortest Safe Evacuation Route</span>
              </div>
              <span className="text-xs font-mono font-bold text-cyan-400">
                Exit: {worker.assignedExitId}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-slate-300 pt-1">
              <span>Total Distance: <strong>{worker.distanceToExit} meters</strong></span>
              <span>Estimated Walk: <strong>~{Math.round((worker.estimatedEvacTimeSeconds || 0) / 60)} min</strong></span>
            </div>

            <div className="pt-2">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">
                Waypoint Path Sequence:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {worker.currentRoute?.map((node, idx) => (
                  <React.Fragment key={idx}>
                    <span className="font-mono text-xs font-bold bg-slate-800 text-cyan-300 px-2 py-0.5 rounded border border-slate-700">
                      {node}
                    </span>
                    {idx < worker.currentRoute.length - 1 && (
                      <span className="text-slate-500 text-xs">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-mine-border/80 bg-slate-900/60 px-6 py-3">
          <button
            onClick={() => {
              onFocusRoute?.(worker.id);
              onClose();
            }}
            className="flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 font-mono text-xs font-bold text-white hover:bg-cyan-500 shadow-lg shadow-cyan-950 transition"
          >
            <Compass className="h-3.5 w-3.5" />
            Highlight Route on Map
          </button>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-2 font-mono text-xs font-bold text-white hover:bg-slate-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
