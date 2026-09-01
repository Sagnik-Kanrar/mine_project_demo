import React from 'react';
import { useMine } from '../context/MineContext';
import { RiskBadge } from '../components/common/RiskBadge';
import {
  Layers,
  Wind,
  Flame,
  Clock,
  Compass,
} from 'lucide-react';

export const ZonesPage = () => {
  const { zones = [], sensors = [], workers = [], tunnels = [], setSelectedZoneFilter, setActivePage } = useMine();

  return (
    <div className="space-y-6 animate-fadeIn font-mono">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-white font-mono">
              MINE ZONE GEOLOGICAL MANAGEMENT
            </h1>
            <span className="text-xs bg-cyan-950 text-cyan-300 px-2.5 py-0.5 rounded border border-cyan-500/40 font-bold">
              4 OPERATIONAL PANELS
            </span>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Geotechnical Sector Profiling, Strata Subsidence Vulnerability & Ventilation Telemetry
          </p>
        </div>
      </div>

      {/* Zone Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {zones.map((zone) => {
          const zoneSensors = sensors.filter((s) => s.zone === zone.id);
          const zoneWorkers = workers.filter((w) => w.zone === zone.id);
          const zoneTunnels = tunnels.filter((t) => t.zone === zone.id);

          return (
            <div
              key={zone.id}
              className={`rounded-2xl border p-6 shadow-xl space-y-4 transition-all ${
                zone.riskLevel === 'CRITICAL'
                  ? 'bg-red-950/40 border-red-500 shadow-red-950/50'
                  : zone.riskLevel === 'WARNING'
                  ? 'bg-amber-950/30 border-amber-500/40'
                  : 'bg-mine-card/90 border-mine-border'
              }`}
            >
              {/* Header: Name & Risk */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-slate-800 p-3 text-cyan-400">
                    <Layers className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{zone.name}</h3>
                    <p className="text-xs text-slate-400 font-sans">{zone.description}</p>
                  </div>
                </div>
                <RiskBadge level={zone.riskLevel} size="md" />
              </div>

              {/* Seam Depth & Specifications */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg bg-mine-darkest p-3 border border-slate-800 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase">COAL SEAM</span>
                  <p className="font-bold text-slate-200">{zone.seamName}</p>
                  <span className="text-[11px] text-cyan-400">Subsurface Depth: {zone.depthMeters}m</span>
                </div>

                <div className="rounded-lg bg-mine-darkest p-3 border border-slate-800 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase">PEAK DEFORMATION</span>
                  <p className="font-bold text-amber-300 text-lg">{(zone.latestDeformationMm || 0).toFixed(1)} mm</p>
                  <span className="text-[11px] text-slate-400">Velocity: &lt;1.0 mm/min</span>
                </div>
              </div>

              {/* Resource Counts (Sensors, Miners, Tunnels) */}
              <div className="grid grid-cols-3 gap-2 text-xs text-center">
                <div className="rounded-lg bg-slate-900/80 p-2.5 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">SENSORS</span>
                  <strong className="text-white text-sm">{zoneSensors.length} Nodes</strong>
                </div>
                <div className="rounded-lg bg-slate-900/80 p-2.5 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">WORKERS</span>
                  <strong className="text-white text-sm">{zoneWorkers.length} Miners</strong>
                </div>
                <div className="rounded-lg bg-slate-900/80 p-2.5 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">TUNNELS</span>
                  <strong className="text-white text-sm">{zoneTunnels.length} Segments</strong>
                </div>
              </div>

              {/* Environmental Safety Parameters */}
              <div className="rounded-lg bg-slate-900/60 p-3 border border-slate-800 grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Wind className="h-4 w-4 text-cyan-400" />
                  <div>
                    <span className="text-slate-400 block text-[11px]">Air Velocity</span>
                    <strong className="text-white">{zone.airVelocityMps} m/s (Optimal)</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-emerald-400" />
                  <div>
                    <span className="text-slate-400 block text-[11px]">Methane (CH4)</span>
                    <strong className="text-emerald-300">{zone.ch4Percentage}% (Safe)</strong>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Filter Action */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <span className="text-slate-500 text-[11px] flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Last Audit: {new Date(zone.lastAlertTime).toLocaleTimeString()}
                </span>

                <button
                  onClick={() => {
                    setSelectedZoneFilter(zone.id);
                    setActivePage('map');
                  }}
                  className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
                >
                  <Compass className="h-3.5 w-3.5" />
                  Filter on Live Map →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
