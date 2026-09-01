import React from 'react';
import { useMine } from '../../context/MineContext';
import {
  RotateCcw,
  AlertTriangle,
  Flame,
  UserX,
  WifiOff,
  CheckCircle2,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';

export const DemoControlBar = () => {
  const {
    simulationState,
    runScenarioNormal,
    runScenarioSubsidence,
    runScenarioCollapse,
    runScenarioWorkerSOS,
    runScenarioSensorOffline,
    bannerNotification,
    clearBannerNotification,
    setIsSIHTourOpen,
    setIsSensorSimulatorOpen,
  } = useMine();

  return (
    <div className="border-b border-cyan-500/30 bg-[#060D1A]/95 backdrop-blur-md px-4 sm:px-6 py-2.5 shadow-xl transition-all">
      {/* Top Banner Message (if any) */}
      {bannerNotification && (
        <div className="mb-2 flex items-center justify-between rounded-lg bg-cyan-950/90 border border-cyan-500/50 px-4 py-2 text-xs font-mono text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.25)] animate-fadeIn">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />
            <span className="font-bold">{bannerNotification}</span>
          </div>
          <button
            onClick={clearBannerNotification}
            className="text-slate-400 hover:text-white font-bold px-2 py-0.5 rounded text-[11px]"
          >
            ✕ Dismiss
          </button>
        </div>
      )}

      {/* Control Header & Scenario Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* SIH Judge Demo Tour Trigger Button */}
          <button
            onClick={() => setIsSIHTourOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-mono text-xs font-black px-3 py-1.5 shadow-[0_0_16px_rgba(245,158,11,0.4)] transition animate-pulse"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>START SIH JUDGE TOUR</span>
          </button>

          {/* Live Sensor Slider Trigger */}
          <button
            onClick={() => setIsSensorSimulatorOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-cyan-950/90 border border-cyan-500/50 hover:bg-cyan-900 text-cyan-300 font-mono text-xs font-bold px-3 py-1.5 transition"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Telemetry Sliders</span>
          </button>

          <span className="hidden lg:inline font-mono text-xs text-slate-400">
            Active: <strong className="text-white">{simulationState.activeScenarioName}</strong>
          </span>
        </div>

        {/* Buttons Grid */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            onClick={runScenarioNormal}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-mono text-xs font-bold transition ${
              simulationState.mode === 'NORMAL'
                ? 'bg-emerald-600 text-white shadow-[0_0_12px_#10b981]'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
            }`}
            title="Reset mine to verified safe baseline"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Normal</span>
          </button>

          <button
            onClick={runScenarioSubsidence}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-mono text-xs font-bold transition ${
              simulationState.mode === 'INCREASING_SUBSIDENCE'
                ? 'bg-amber-600 text-white shadow-[0_0_12px_#f59e0b]'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
            }`}
            title="Simulate increasing displacement, tilt and vibration in Zone B"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
            <span>Subsidence</span>
          </button>

          <button
            onClick={runScenarioCollapse}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-mono text-xs font-black transition ${
              simulationState.mode === 'TUNNEL_COLLAPSE'
                ? 'bg-red-600 text-white shadow-[0_0_16px_#ef4444] animate-pulse'
                : 'bg-red-950/80 text-red-300 hover:bg-red-900 border border-red-500/50'
            }`}
            title="Trigger catastrophic collapse in Tunnel T-07 with instant dynamic safe rerouting"
          >
            <Flame className="h-3.5 w-3.5 text-red-400" />
            <span>Collapse T-07</span>
          </button>

          <button
            onClick={runScenarioWorkerSOS}
            className={`hidden sm:flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-mono text-xs font-bold transition ${
              simulationState.mode === 'WORKER_EMERGENCY'
                ? 'bg-purple-600 text-white shadow-[0_0_12px_#9333ea]'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
            }`}
            title="Simulate miner medical emergency / trapped alert"
          >
            <UserX className="h-3.5 w-3.5 text-purple-400" />
            <span>Worker SOS</span>
          </button>

          <button
            onClick={runScenarioSensorOffline}
            className={`hidden md:flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-mono text-xs font-bold transition ${
              simulationState.mode === 'SENSOR_FAILURE'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
            }`}
            title="Simulate telemetry loss on SENS-001"
          >
            <WifiOff className="h-3.5 w-3.5 text-slate-400" />
            <span>Sensor Offline</span>
          </button>

          <button
            onClick={runScenarioNormal}
            className="flex items-center gap-1 rounded-lg bg-slate-900 border border-slate-800 px-2 py-1.5 text-slate-400 hover:text-white transition"
            title="Reset All"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
