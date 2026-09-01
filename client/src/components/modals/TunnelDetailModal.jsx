import React from 'react';
import { RiskBadge } from '../common/RiskBadge';
import { X, Activity, ShieldCheck, ShieldAlert, Ruler, Gauge, Clock } from 'lucide-react';

export const TunnelDetailModal = ({ tunnel, sensors = [], onClose }) => {
  if (!tunnel) return null;

  const connectedSensors = sensors.filter((s) => tunnel.sensorIds?.includes(s.id) || s.tunnelId === tunnel.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-mine-border bg-mine-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-mine-border/80 bg-slate-900/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-slate-800 p-2 text-cyan-400">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-lg font-black text-white">{tunnel.id}</h3>
                <RiskBadge level={tunnel.riskLevel} size="sm" />
              </div>
              <p className="text-xs text-slate-400">{tunnel.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-4 p-6 text-sm">
          {/* Key Metric Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-mine-border/80 bg-slate-900/60 p-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Ruler className="h-3.5 w-3.5 text-cyan-400" />
                <span>Segment Length</span>
              </div>
              <p className="font-mono text-lg font-bold text-white">{tunnel.distance} meters</p>
              <p className="text-[11px] text-slate-500 font-mono">Cross: {tunnel.crossSection}</p>
            </div>

            <div className="rounded-xl border border-mine-border/80 bg-slate-900/60 p-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Gauge className="h-3.5 w-3.5 text-amber-400" />
                <span>Current Deformation</span>
              </div>
              <p className="font-mono text-lg font-bold text-white">{(tunnel.deformationMm || 0).toFixed(1)} mm</p>
              <p className="text-[11px] text-slate-500 font-mono">Velocity: {(tunnel.velocityMmPerMin || 0).toFixed(2)} mm/min</p>
            </div>
          </div>

          {/* Status & Evacuation Availability */}
          <div className="rounded-xl border border-mine-border/80 bg-slate-900/60 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Evacuation Routing Status:</span>
              {tunnel.isAvailableForEvacuation && tunnel.status !== 'COLLAPSED' ? (
                <span className="flex items-center gap-1.5 font-mono text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/40">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  AVAILABLE FOR PASSAGE
                </span>
              ) : (
                <span className="flex items-center gap-1.5 font-mono text-xs font-bold text-red-400 bg-red-950/80 px-2.5 py-1 rounded-full border border-red-500/60 animate-pulse">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  BLOCKED / AVOID TUNNEL
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 text-xs font-mono text-slate-300 border-t border-slate-800">
              <div>
                <span className="text-slate-500">Zone:</span> {tunnel.zone}
              </div>
              <div>
                <span className="text-slate-500">Connectivity:</span> {tunnel.fromNode} ↔ {tunnel.toNode}
              </div>
              <div>
                <span className="text-slate-500">Support Type:</span> {tunnel.supportType}
              </div>
              <div>
                <span className="text-slate-500">Walk Time:</span> ~{tunnel.travelTimeSeconds}s
              </div>
            </div>
          </div>

          {/* Connected Strata Sensors */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Associated Strata Telemetry Nodes ({connectedSensors.length})
            </h4>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {connectedSensors.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No direct sensors assigned.</p>
              ) : (
                connectedSensors.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-lg bg-slate-900/80 px-3 py-2 border border-slate-800 text-xs font-mono"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${s.status === 'CRITICAL' ? 'bg-red-500' : s.status === 'WARNING' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                      <span className="font-bold text-white">{s.id}</span>
                      <span className="text-slate-400 text-[11px]">{s.type?.replace('_', ' ')}</span>
                    </div>
                    <span className="font-bold text-cyan-300">
                      {s.value} {s.unit}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
            <Clock className="h-3 w-3" />
            <span>Last Physical Inspection: {tunnel.lastInspection}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-mine-border/80 bg-slate-900/60 px-6 py-3 text-right">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-1.5 font-mono text-xs font-bold text-white hover:bg-slate-700 transition"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
