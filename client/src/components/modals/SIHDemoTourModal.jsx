import React, { useState } from 'react';
import { useMine } from '../../context/MineContext';
import {
  Sparkles,
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  RotateCcw,
  Volume2,
} from 'lucide-react';

export const SIHDemoTourModal = () => {
  const {
    isSIHTourOpen,
    setIsSIHTourOpen,
    setActivePage,
    runScenarioNormal,
    runScenarioSubsidence,
    runScenarioCollapse,
    advanceEvacuation,
    fetchWorkerRoute,
  } = useMine();

  const [currentStep, setCurrentStep] = useState(0);

  if (!isSIHTourOpen) return null;

  const tourSteps = [
    {
      step: 1,
      title: 'Step 1: Baseline Shift & LoRaWAN Strata Telemetry',
      badge: 'NORMAL BASELINE',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-500/40',
      action: async () => {
        await runScenarioNormal();
        setActivePage('dashboard');
      },
      scriptText:
        '“Good morning esteemed SIH Evaluators. MINEGUARD AI continuously monitors underground strata using 24 low-cost IoT nodes connected via LoRaWAN 868MHz mesh across Raniganj Seam 3. Right now, all 4 mine zones (A, B, C, D) are operating in nominal state with strata displacement below 3.0 mm and AI subsidence risk at 21%.”',
      highlights: [
        '24 Simulated Strata Nodes (LVDT, Clinometers, Geophones, Stress cells)',
        'Underground Positioning System (UWB/BLE/IMU) tracking 8 tagged miners',
        'Composite AI Risk Gauge at SAFE (<35%)',
      ],
    },
    {
      step: 2,
      title: 'Step 2: Early Micro-Seismic Strata Subsidence Detection',
      badge: 'AI PREDICTIVE INGESTION',
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-500/40',
      action: async () => {
        await runScenarioSubsidence();
        setActivePage('ai-prediction');
      },
      scriptText:
        '“As longwall coal extraction advances in Zone B, sensors SENS-001 and SENS-005 detect abnormal roof displacement (8.4 mm) and 54.8 Hz acoustic emissions. The AI subsidence engine ingests the multi-parameter stream and forecasts a 30-minute deformation curve, escalating the risk tier to WARNING and logging a DGMS proactive alert.”',
      highlights: [
        'Multi-parameter feature ingestion (Roof displacement, velocity, tilt, acoustic emission)',
        '30-minute predictive deformation forecast with 95% confidence bounds',
        'Explainable AI (XAI) feature importance ranking',
      ],
    },
    {
      step: 3,
      title: 'Step 3: Catastrophic Roof Fall & Tunnel T-07 Collapse',
      badge: 'CODE RED EMERGENCY',
      badgeColor: 'bg-red-950 text-red-300 border-red-500/50 animate-pulse',
      action: async () => {
        await runScenarioCollapse();
        setActivePage('map');
      },
      scriptText:
        '“Critical threshold breached! Tunnel T-07 in Zone B collapses with 18.9 mm displacement. The system activates DGMS Code Red emergency protocol, triggers synthesized audio alarms, initiates SMS broadcasts, and immediately removes the impassable segment (Cost = ∞) from the mine routing graph.”',
      highlights: [
        'Tunnel T-07 marked COLLAPSED with Infinite Cost penalty in routing graph',
        'Emergency mode engaged with synthesized control-room siren',
        '3 underground miners in Zone B flagged for emergency evacuation',
      ],
    },
    {
      step: 4,
      title: 'Step 4: Dijkstra Dynamic Detour Evacuation Routing',
      badge: 'INTELLIGENT REROUTE',
      badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-500/50',
      action: async () => {
        await fetchWorkerRoute('W-001');
        setActivePage('evacuation');
      },
      scriptText:
        '“Here is the core SIH innovation. Naive Dijkstra would route Worker W-001 straight into the collapsed tunnel T-07. MINEGUARD AI applies risk penalties: Cost(e) = Distance × W_Risk. The engine dynamically recalculates the path, avoiding T-07 and guiding W-001 via a safe detour through Junctions J3, J2, and Tunnel T-1 directly to Surface Exit E1!”',
      highlights: [
        'Old blocked path: W1 → J4 → T7 → T8 → Exit E2 (BLOCKED)',
        'New calculated safe detour: W1 → J4 → J3 → T5 → T6 → Exit E1',
        'Turn-by-turn HUD instructions updated in real time',
      ],
    },
    {
      step: 5,
      title: 'Step 5: Safe Arrival & DGMS Audit Report Compilation',
      badge: 'WORKFORCE SECURED',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-500/40',
      action: async () => {
        await advanceEvacuation();
        await advanceEvacuation();
        setActivePage('analytics');
      },
      scriptText:
        '“All miners safely reach surface exit portals. The system logs the entire incident timeline into the DGMS Audit compliance ledger, tracking sensor telemetry historical curves and evacuation drill metrics. MINEGUARD AI delivers a zero-casualty mine safety ecosystem ready for Indian coalfield deployment.”',
      highlights: [
        'Miners successfully evacuated to Surface Exit E1',
        'Complete chronological incident audit log in Compliance Ledger',
        'Ready for hardware deployment with ESP32 & LoRaWAN IN865 gateways',
      ],
    },
  ];

  const current = tourSteps[currentStep];

  const handleNext = async () => {
    if (currentStep < tourSteps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      await tourSteps[nextStep].action();
    }
  };

  const handlePrev = async () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      await tourSteps[prevStep].action();
    }
  };

  const handleStartStep = async (stepIdx) => {
    setCurrentStep(stepIdx);
    await tourSteps[stepIdx].action();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn font-mono">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border-2 border-cyan-500 bg-[#0A0E1A] shadow-[0_0_50px_rgba(6,182,212,0.3)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/30 bg-cyan-950/40 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-cyan-600 p-2.5 text-white shadow-[0_0_15px_#06b6d4]">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white uppercase tracking-wider">
                  SIH Judge 5-Minute Demonstration Tour
                </h2>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/40 font-bold">
                  STEP {current.step} OF 5
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                Interactive Guided Demonstration Script for Smart India Hackathon Evaluators
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSIHTourOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="grid grid-cols-5 gap-1.5 px-6 pt-4">
          {tourSteps.map((s, idx) => (
            <button
              key={s.step}
              onClick={() => handleStartStep(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentStep
                  ? 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]'
                  : idx < currentStep
                  ? 'bg-emerald-500'
                  : 'bg-slate-800 hover:bg-slate-700'
              }`}
              title={s.title}
            />
          ))}
        </div>

        {/* Body Content */}
        <div className="space-y-4 p-6 text-xs">
          {/* Step Title & Badge */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-black text-white">{current.title}</h3>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${current.badgeColor}`}>
              {current.badge}
            </span>
          </div>

          {/* Script Box */}
          <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-[11px] uppercase tracking-wider">
              <Volume2 className="h-3.5 w-3.5 text-cyan-400" />
              <span>Presenter Script (Read Aloud to Evaluator):</span>
            </div>
            <p className="font-sans text-xs italic leading-relaxed text-slate-200">
              {current.scriptText}
            </p>
          </div>

          {/* Technical Key Highlights */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              What the System is Demonstrating Live:
            </span>
            <ul className="space-y-1.5 text-[11px] text-slate-300">
              {current.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-900/60 px-6 py-4">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
              currentStep === 0
                ? 'opacity-40 cursor-not-allowed text-slate-500'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            Previous Step
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleStartStep(0)}
              className="flex items-center gap-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 px-3 py-2 text-xs transition"
              title="Reset Tour"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>

            {currentStep < tourSteps.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-5 py-2 text-xs font-bold transition shadow-lg shadow-cyan-950"
              >
                <span>Trigger Next Step</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => setIsSIHTourOpen(false)}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 text-xs font-bold transition shadow-lg shadow-emerald-950"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Finish Demonstration</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
