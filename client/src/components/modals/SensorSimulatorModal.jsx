import React, { useState } from 'react';
import { useMine } from '../../context/MineContext';
import {
  Sliders,
  X,
  Activity,
  Compass,
  Gauge,
  RotateCcw,
} from 'lucide-react';
import { RiskGauge } from '../common/RiskGauge';

export const SensorSimulatorModal = () => {
  const {
    isSensorSimulatorOpen,
    setIsSensorSimulatorOpen,
    sensors,
    overrideSensorValue,
    aiPrediction,
    runScenarioNormal,
  } = useMine();

  // Find target sensors
  const dispSensor = sensors.find((s) => s.id === 'SENS-001') || sensors[0];
  const tiltSensor = sensors.find((s) => s.id === 'SENS-005') || sensors[4];
  const vibSensor = sensors.find((s) => s.id === 'SENS-013') || sensors[12];
  const stressSensor = sensors.find((s) => s.id === 'SENS-017') || sensors[16];

  const [dispVal, setDispVal] = useState(dispSensor?.value || 3.8);
  const [tiltVal, setTiltVal] = useState(tiltSensor?.value || 0.8);
  const [vibVal, setVibVal] = useState(vibSensor?.value || 12.4);
  const [stressVal, setStressVal] = useState(stressSensor?.value || 18.5);

  if (!isSensorSimulatorOpen) return null;

  const handleDispChange = (val) => {
    setDispVal(val);
    if (dispSensor) overrideSensorValue(dispSensor.id, val);
  };

  const handleTiltChange = (val) => {
    setTiltVal(val);
    if (tiltSensor) overrideSensorValue(tiltSensor.id, val);
  };

  const handleVibChange = (val) => {
    setVibVal(val);
    if (vibSensor) overrideSensorValue(vibSensor.id, val);
  };

  const handleStressChange = (val) => {
    setStressVal(val);
    if (stressSensor) overrideSensorValue(stressSensor.id, val);
  };

  const handleReset = async () => {
    await runScenarioNormal();
    setDispVal(3.8);
    setTiltVal(0.8);
    setVibVal(12.4);
    setStressVal(18.5);
  };

  const currentScore = aiPrediction?.overallRiskScore || 21;
  const currentRisk = aiPrediction?.riskClassification || 'SAFE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn font-mono">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border-2 border-cyan-500/60 bg-[#0A0E1A] shadow-[0_0_50px_rgba(6,182,212,0.3)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/30 bg-cyan-950/40 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-cyan-600 p-2.5 text-white shadow-[0_0_15px_#06b6d4]">
              <Sliders className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white uppercase tracking-wider">
                  Live IoT Strata Telemetry Injector
                </h2>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/40 font-bold">
                  INTERACTIVE SENSITIVITY AUDIT
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                Drag live telemetry sliders to test real-time AI Risk Classification & Dijkstra graph response
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSensorSimulatorOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 text-xs">
          {/* Sliders (2 cols) */}
          <div className="md:col-span-2 space-y-4">
            {/* Slider 1: Roof Displacement */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-200">
                  <Activity className="h-4 w-4 text-cyan-400" />
                  <span className="font-bold">Roof Displacement (SENS-001)</span>
                </div>
                <span className="text-sm font-black text-cyan-300">{dispVal} mm</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="22.0"
                step="0.1"
                value={dispVal}
                onChange={(e) => handleDispChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0.5mm (Safe)</span>
                <span>10.0mm (Warning)</span>
                <span className="text-red-400">15.0mm (Critical Collapse)</span>
              </div>
            </div>

            {/* Slider 2: Biaxial Tilt Angle */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-200">
                  <Compass className="h-4 w-4 text-amber-400" />
                  <span className="font-bold">Biaxial Roof Tilt (SENS-005)</span>
                </div>
                <span className="text-sm font-black text-amber-300">{tiltVal}°</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="8.0"
                step="0.1"
                value={tiltVal}
                onChange={(e) => handleTiltChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0.1° (Nominal)</span>
                <span>4.5° (Warning)</span>
                <span className="text-red-400">6.0° (Severe Delamination)</span>
              </div>
            </div>

            {/* Slider 3: Micro-Seismic Vibration */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-200">
                  <Activity className="h-4 w-4 text-purple-400" />
                  <span className="font-bold">Micro-Seismic Vibration (SENS-013)</span>
                </div>
                <span className="text-sm font-black text-purple-300">{vibVal} Hz</span>
              </div>
              <input
                type="range"
                min="5.0"
                max="90.0"
                step="0.5"
                value={vibVal}
                onChange={(e) => handleVibChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>5 Hz (Quiet)</span>
                <span>45 Hz (Acoustic Emission)</span>
                <span className="text-red-400">75 Hz (Rock Fracture)</span>
              </div>
            </div>

            {/* Slider 4: Hydraulic Load Cell Stress */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-200">
                  <Gauge className="h-4 w-4 text-emerald-400" />
                  <span className="font-bold">Strata Load Pressure (SENS-017)</span>
                </div>
                <span className="text-sm font-black text-emerald-300">{stressVal} MPa</span>
              </div>
              <input
                type="range"
                min="5.0"
                max="55.0"
                step="0.5"
                value={stressVal}
                onChange={(e) => handleStressChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>5 MPa (Nominal)</span>
                <span>38 MPa (High Load)</span>
                <span className="text-red-400">45 MPa (Yield Limit)</span>
              </div>
            </div>
          </div>

          {/* Real-time AI Risk Output */}
          <div className="rounded-xl border border-cyan-500/40 bg-slate-900/90 p-4 flex flex-col justify-between space-y-4">
            <div className="border-b border-slate-800 pb-2 text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Live AI Risk Output
              </span>
            </div>

            <div className="py-2 flex justify-center">
              <RiskGauge score={currentScore} classification={currentRisk} size={180} />
            </div>

            <div className="rounded-lg bg-mine-darkest p-3 border border-slate-800 text-[11px] space-y-1.5">
              <div className="text-slate-400">
                Inference Status:{' '}
                <strong className={currentRisk === 'CRITICAL' ? 'text-red-400' : currentRisk === 'WARNING' ? 'text-amber-300' : 'text-emerald-400'}>
                  {currentRisk}
                </strong>
              </div>
              <p className="text-slate-300 font-sans text-[10px] leading-tight">
                {aiPrediction?.explanation?.summary || 'Nominal stability.'}
              </p>
            </div>

            <button
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 p-2.5 font-bold transition border border-slate-700"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Sliders to Safe
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 bg-slate-900/60 px-6 py-3 text-right">
          <button
            onClick={() => setIsSensorSimulatorOpen(false)}
            className="rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2 font-bold transition shadow-lg shadow-cyan-950 text-xs"
          >
            Apply & Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
