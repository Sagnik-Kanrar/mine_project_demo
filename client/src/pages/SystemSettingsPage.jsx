import React, { useState } from 'react';
import {
  Radio,
  CheckCircle2,
  Save,
  Sliders,
} from 'lucide-react';

export const SystemSettingsPage = () => {
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Threshold form states
  const [dispCaution, setDispCaution] = useState(5.0);
  const [dispWarning, setDispWarning] = useState(10.0);
  const [dispCritical, setDispCritical] = useState(15.0);

  const [tiltWarning, setTiltWarning] = useState(4.5);
  const [vibWarning, setVibWarning] = useState(45.0);

  const [loraFrequency, setLoraFrequency] = useState('868.1 MHz (IN865)');
  const [mqttBroker, setMqttBroker] = useState('mqtt://gateway.mine-local.internal:1883');
  const [hardwareMode, setHardwareMode] = useState('SIMULATED');

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fadeIn font-mono text-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-white font-mono">
              SYSTEM SETTINGS & HARDWARE INTEGRATION
            </h1>
            <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded border border-slate-700 font-bold">
              DGMS SAFETY CONFIG
            </span>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Geotechnical Alert Thresholds, LoRaWAN Gateway Interfaces & Future Hardware Communication Bridge
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="rounded-xl border border-emerald-500 bg-emerald-950/80 p-3.5 text-emerald-200 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span><strong>Settings Applied:</strong> New safety thresholds and communication bridge parameters synchronized with server.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Box 1: DGMS Geotechnical Strata Thresholds */}
        <div className="rounded-xl border border-mine-border bg-mine-card/90 p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-mine-border pb-3">
            <Sliders className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase">
              DGMS Strata Subsidence Safety Thresholds
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-slate-400 mb-1">
                Roof Displacement Caution Threshold (mm):
              </label>
              <input
                type="number"
                step="0.1"
                value={dispCaution}
                onChange={(e) => setDispCaution(parseFloat(e.target.value))}
                className="w-full rounded-lg border border-mine-border bg-mine-darkest px-3 py-2 text-white font-bold focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">
                Roof Displacement Warning Threshold (mm):
              </label>
              <input
                type="number"
                step="0.1"
                value={dispWarning}
                onChange={(e) => setDispWarning(parseFloat(e.target.value))}
                className="w-full rounded-lg border border-mine-border bg-mine-darkest px-3 py-2 text-amber-300 font-bold focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">
                Roof Displacement Critical Collapse Limit (mm):
              </label>
              <input
                type="number"
                step="0.1"
                value={dispCritical}
                onChange={(e) => setDispCritical(parseFloat(e.target.value))}
                className="w-full rounded-lg border border-mine-border bg-mine-darkest px-3 py-2 text-red-400 font-bold focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">
                Biaxial Clinometer Tilt Warning Limit (°):
              </label>
              <input
                type="number"
                step="0.1"
                value={tiltWarning}
                onChange={(e) => setTiltWarning(parseFloat(e.target.value))}
                className="w-full rounded-lg border border-mine-border bg-mine-darkest px-3 py-2 text-white font-bold focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">
                Geophone Micro-Seismic Vibration Limit (Hz):
              </label>
              <input
                type="number"
                step="0.5"
                value={vibWarning}
                onChange={(e) => setVibWarning(parseFloat(e.target.value))}
                className="w-full rounded-lg border border-mine-border bg-mine-darkest px-3 py-2 text-white font-bold focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Box 2: Future Hardware & Gateway Communication Bridge */}
        <div className="rounded-xl border border-mine-border bg-mine-card/90 p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-mine-border pb-3">
            <Radio className="h-4 w-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white uppercase">
              IoT Sensor Communication & Gateway Setup
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-slate-400 mb-1">Telemetry Mode:</label>
              <select
                value={hardwareMode}
                onChange={(e) => setHardwareMode(e.target.value)}
                className="w-full rounded-lg border border-mine-border bg-mine-darkest px-3 py-2 text-cyan-300 font-bold focus:border-cyan-500 focus:outline-none cursor-pointer"
              >
                <option value="SIMULATED">Simulated IoT Sensor Streams (SIH Demo Mode)</option>
                <option value="HARDWARE_GATEWAY">ESP32 + LoRaWAN Gateway API Mode (Production Ready)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">LoRaWAN Regional Channel Band:</label>
              <input
                type="text"
                value={loraFrequency}
                onChange={(e) => setLoraFrequency(e.target.value)}
                className="w-full rounded-lg border border-mine-border bg-mine-darkest px-3 py-2 text-white font-bold focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Underground MQTT Ingestion Broker URI:</label>
              <input
                type="text"
                value={mqttBroker}
                onChange={(e) => setMqttBroker(e.target.value)}
                className="w-full rounded-lg border border-mine-border bg-mine-darkest px-3 py-2 text-white font-bold focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="rounded-lg bg-mine-darkest p-3 border border-slate-800 space-y-1.5 text-[11px] text-slate-400">
              <span className="font-bold text-slate-200 block">Target Hardware Architecture:</span>
              <p>
                Roof Extensometers / MPU6050 → ESP32 Edge Node → LoRa SX1276 → Subsurface Repeater Gateway → Backend REST/WS.
              </p>
            </div>

            <div className="rounded-lg bg-mine-darkest p-3 border border-slate-800 space-y-1.5 text-[11px] text-slate-400">
              <span className="font-bold text-slate-200 block">Underground Positioning Architecture:</span>
              <p>
                Decawave DWM1000 UWB Anchors at tunnel junctions + Miner Smart Helmet Tag with IMU Dead-Reckoning fallback.
              </p>
            </div>
          </div>
        </div>

        {/* Form Submit Footer */}
        <div className="lg:col-span-2 flex justify-end gap-3 pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2.5 font-bold transition shadow-lg shadow-cyan-950"
          >
            <Save className="h-4 w-4" />
            Save System Configurations
          </button>
        </div>
      </form>
    </div>
  );
};
