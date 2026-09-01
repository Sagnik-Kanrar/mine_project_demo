import React from 'react';
import { useMine } from '../../context/MineContext';
import {
  AlertTriangle,
  Volume2,
  VolumeX,
  Send,
  Radio,
  X,
  Compass,
  CheckCircle2,
  PhoneCall,
  HardHat,
  DoorOpen,
  Users,
} from 'lucide-react';

export const EmergencyHUDModal = () => {
  const {
    isEmergencyHUDOpen,
    setIsEmergencyHUDOpen,
    simulationState,
    workers,
    toggleSiren,
    sendEmergencySMS,
    setActivePage,
  } = useMine();

  if (!isEmergencyHUDOpen) return null;

  const affectedWorkers = workers.filter((w) => simulationState.affectedWorkerIds?.includes(w.id));
  const otherWorkers = workers.filter((w) => !simulationState.affectedWorkerIds?.includes(w.id));

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#080202]/95 backdrop-blur-md overflow-y-auto text-slate-100 p-4 sm:p-6 animate-fadeIn">
      {/* Top Banner Alert Bar */}
      <div className="flex items-center justify-between border-b-2 border-red-600 bg-red-950/80 px-6 py-4 rounded-xl shadow-[0_0_35px_rgba(239,68,68,0.5)] mb-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-red-600 flex items-center justify-center animate-bounce shadow-[0_0_20px_#ef4444]">
            <AlertTriangle className="h-7 w-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-mono text-2xl font-black tracking-wider text-red-100 uppercase">
                EMERGENCY MODE ACTIVATED
              </h1>
              <span className="font-mono text-xs font-black bg-red-600 text-white px-3 py-1 rounded-full animate-pulse">
                CRITICAL SUBSIDENCE COLLAPSE
              </span>
            </div>
            <p className="text-sm text-red-200 font-mono">
              Mine Safety Level: <strong className="text-white">CODE RED</strong> • Evacuation Protocol DGMS Sec-44 Engaged
            </p>
          </div>
        </div>

        {/* Quick Close / Minimize */}
        <button
          onClick={() => setIsEmergencyHUDOpen(false)}
          className="rounded-lg bg-red-900/60 p-2 text-red-200 hover:bg-red-800 hover:text-white transition"
          title="Minimize Emergency HUD"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 max-w-7xl mx-auto w-full">
        {/* Left Column: Affected Sector & Incident Brief */}
        <div className="space-y-4">
          {/* Incident Details Card */}
          <div className="rounded-xl border border-red-500/40 bg-red-950/40 p-5 shadow-xl space-y-3">
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-red-300 flex items-center gap-2">
              <Radio className="h-4 w-4 text-red-400" />
              Incident Diagnostic
            </h3>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between border-b border-red-900/60 pb-1.5">
                <span className="text-slate-400">Impacted Zone:</span>
                <strong className="text-red-300">ZONE B (Longwall Panel LW-102)</strong>
              </div>
              <div className="flex justify-between border-b border-red-900/60 pb-1.5">
                <span className="text-slate-400">Failed Segment:</span>
                <strong className="text-red-400">Tunnel T-07 (COLLAPSED / IMPASSABLE)</strong>
              </div>
              <div className="flex justify-between border-b border-red-900/60 pb-1.5">
                <span className="text-slate-400">Strata Displacement:</span>
                <strong className="text-red-300">18.9 mm (Exceeds Limit 15mm)</strong>
              </div>
              <div className="flex justify-between border-b border-red-900/60 pb-1.5">
                <span className="text-slate-400">Underground Miners at Risk:</span>
                <strong className="text-amber-300">{affectedWorkers.length} Miners in Zone B</strong>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-slate-400">Intelligent Rerouting:</span>
                <strong className="text-cyan-300">ACTIVE DETOUR TO EXIT E1 / REF-1</strong>
              </div>
            </div>
          </div>

          {/* Quick Action Control Center */}
          <div className="rounded-xl border border-mine-border bg-mine-card/90 p-5 shadow-xl space-y-3">
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <PhoneCall className="h-4 w-4 text-cyan-400" />
              Command Dispatch Actions
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={() => toggleSiren()}
                className={`flex items-center justify-center gap-2 rounded-lg p-3 font-mono text-xs font-bold transition shadow-lg ${
                  simulationState.sirenActive
                    ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {simulationState.sirenActive ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                {simulationState.sirenActive ? 'Silence Siren' : 'Activate Siren'}
              </button>

              <button
                onClick={sendEmergencySMS}
                className="flex items-center justify-center gap-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white p-3 font-mono text-xs font-bold transition shadow-lg"
              >
                <Send className="h-4 w-4" />
                Dispatch SMS & Tag Alert
              </button>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setIsEmergencyHUDOpen(false);
                  setActivePage('evacuation');
                }}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white p-3 font-mono text-xs font-bold transition"
              >
                <Compass className="h-4 w-4" />
                Open Evacuation Navigator
              </button>
            </div>
          </div>
        </div>

        {/* Center & Right Column: Live Safe Evacuation Plans for Miners */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-cyan-500/40 bg-mine-card/90 p-5 shadow-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-mine-border pb-3">
              <div className="flex items-center gap-2">
                <HardHat className="h-5 w-5 text-cyan-400" />
                <h3 className="font-mono text-base font-black text-white">
                  Intelligent Safe Route Guidance (Avoids Collapsed T-07)
                </h3>
              </div>
              <span className="font-mono text-xs text-cyan-300 bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-500/40">
                Algorithm: Dijkstra Safe Path Weighting
              </span>
            </div>

            {/* Affected Workers List */}
            <div className="space-y-3">
              {affectedWorkers.map((worker) => (
                <div
                  key={worker.id}
                  className="rounded-xl border border-amber-500/40 bg-slate-900/90 p-4 space-y-2 hover:border-cyan-500/60 transition"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping" />
                      <strong className="font-mono text-white text-sm">{worker.name} ({worker.id})</strong>
                      <span className="text-xs text-slate-400 font-mono">[{worker.role}]</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                      EVACUATING
                    </span>
                  </div>

                  {/* Calculated Safe Route Guidance */}
                  <div className="rounded-lg bg-mine-darkest p-3 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">Designated Surface Exit:</span>
                      <strong className="text-emerald-400 flex items-center gap-1">
                        <DoorOpen className="h-3.5 w-3.5" />
                        {worker.assignedExitId} (Distance: {worker.distanceToExit}m • ~{Math.round((worker.estimatedEvacTimeSeconds || 0) / 60)} min)
                      </strong>
                    </div>

                    <div className="text-xs font-mono text-slate-300">
                      <span className="text-cyan-400 font-bold block mb-1">SAFE ROUTE DETOUR INSTRUCTION:</span>
                      <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/90 p-2 rounded border border-slate-700">
                        {worker.currentRoute?.map((node, i) => (
                          <React.Fragment key={i}>
                            <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/40">
                              {node}
                            </span>
                            {i < worker.currentRoute.length - 1 && <span className="text-slate-500">→</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Other Mine Zones Workforce Status */}
            <div className="pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-400" />
                Other Safe Sectors (Zones A, C, D) — {otherWorkers.length} Workers Secure
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                {otherWorkers.map((w) => (
                  <div
                    key={w.id}
                    className="flex items-center justify-between rounded-lg bg-slate-900/60 p-2.5 border border-slate-800"
                  >
                    <span className="text-slate-300">{w.name} ({w.id})</span>
                    <span className="text-emerald-400 flex items-center gap-1 font-bold">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Safe ({w.assignedExitId})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
