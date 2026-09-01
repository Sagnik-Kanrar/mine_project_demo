import React, { useState } from 'react';
import { useMine } from '../context/MineContext';
import { ResponsiveContainer, YAxis, Tooltip, AreaChart, Area } from 'recharts';
import {
  Radio,
  Activity,
  Battery,
  Wifi,
  Gauge,
  Compass,
  AlertTriangle,
  CheckCircle2,
  Filter,
} from 'lucide-react';

export const SensorsPage = () => {
  const {
    sensors = [],
    setSelectedSensor,
    runScenarioNormal,
    runScenarioSubsidence,
    runScenarioCollapse,
    selectedZoneFilter,
  } = useMine();

  const [typeFilter, setTypeFilter] = useState('ALL');

  const filteredSensors = sensors.filter((s) => {
    const matchesZone = selectedZoneFilter === 'ALL' || s.zone === selectedZoneFilter;
    const matchesType = typeFilter === 'ALL' || s.type === typeFilter;
    return matchesZone && matchesType;
  });

  // Pick representative sensors for the 4 core telemetry charts
  const dispSensor = sensors.find((s) => s.type === 'GROUND_DISPLACEMENT' && s.status !== 'OFFLINE') || sensors[0] || { id: 'SENS-001', value: 3.8, unit: 'mm', history: [] };
  const tiltSensor = sensors.find((s) => s.type === 'TILT_ANGLE' && s.status !== 'OFFLINE') || sensors[4] || { id: 'SENS-005', value: 0.8, unit: '°', history: [] };
  const vibSensor = sensors.find((s) => s.type === 'VIBRATION' && s.status !== 'OFFLINE') || sensors[12] || { id: 'SENS-013', value: 12.4, unit: 'Hz', history: [] };
  const pressSensor = sensors.find((s) => s.type === 'PRESSURE_STRESS' && s.status !== 'OFFLINE') || sensors[16] || { id: 'SENS-017', value: 18.5, unit: 'MPa', history: [] };

  const getStatusBadge = (sensor) => {
    if (sensor.status === 'OFFLINE') {
      return (
        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
          ⚠️ SENSOR OFFLINE
        </span>
      );
    }
    if (sensor.status === 'CRITICAL') {
      return (
        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/50 animate-pulse">
          CRITICAL
        </span>
      );
    }
    if (sensor.status === 'WARNING') {
      return (
        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40">
          WARNING
        </span>
      );
    }
    return (
      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
        NORMAL
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-mono text-2xl font-black tracking-tight text-white">STRATA SENSOR MONITORING</h1>
            <span className="font-mono text-xs bg-cyan-950 text-cyan-300 px-2.5 py-0.5 rounded border border-cyan-500/40 font-bold">
              24 IOT NODES ONLINE
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Multi-Parameter Strata Monitoring: LVDT Displacement, Tilt Clinometers, Geophones & Stress Cells
          </p>
        </div>

        {/* Sensor Simulation Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={runScenarioNormal}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500 hover:text-emerald-300 text-slate-200 px-3 py-2 text-xs font-mono font-bold transition shadow-sm"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            Simulate Normal
          </button>

          <button
            onClick={runScenarioSubsidence}
            className="flex items-center gap-1.5 rounded-xl bg-amber-950/80 border border-amber-500/50 hover:bg-amber-900 text-amber-200 px-3 py-2 text-xs font-mono font-bold transition shadow-sm"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
            Simulate Warning
          </button>

          <button
            onClick={runScenarioCollapse}
            className="flex items-center gap-1.5 rounded-xl bg-red-950/90 border border-red-500/60 hover:bg-red-900 text-red-200 px-3 py-2 text-xs font-mono font-black transition shadow-lg shadow-red-950"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-red-400 animate-pulse" />
            Simulate Critical Subsidence
          </button>
        </div>
      </div>

      {/* 4 Real-time Telemetry Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Chart 1: Ground Displacement */}
        <div className="rounded-xl border border-mine-border bg-mine-card/90 p-4 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
              <Activity className="h-4 w-4 text-cyan-400" />
              <span>Displacement ({dispSensor.id})</span>
            </div>
            <span className="font-mono text-xs font-black text-cyan-300">
              {dispSensor.value} {dispSensor.unit}
            </span>
          </div>
          <div className="h-28 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dispSensor.history || []}>
                <defs>
                  <linearGradient id="c1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <YAxis stroke="#475569" fontSize={8} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#0D131F', borderColor: '#1F2C47', fontSize: '11px' }} />
                <Area type="monotone" dataKey="value" stroke="#06B6D4" fill="url(#c1)" strokeWidth={2} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] font-mono text-slate-500">Zone B • Threshold 10.0mm</p>
        </div>

        {/* Chart 2: Tilt Angle */}
        <div className="rounded-xl border border-mine-border bg-mine-card/90 p-4 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
              <Compass className="h-4 w-4 text-amber-400" />
              <span>Tilt Angle ({tiltSensor.id})</span>
            </div>
            <span className="font-mono text-xs font-black text-amber-300">
              {tiltSensor.value} {tiltSensor.unit}
            </span>
          </div>
          <div className="h-28 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tiltSensor.history || []}>
                <defs>
                  <linearGradient id="c2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <YAxis stroke="#475569" fontSize={8} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#0D131F', borderColor: '#1F2C47', fontSize: '11px' }} />
                <Area type="monotone" dataKey="value" stroke="#F59E0B" fill="url(#c2)" strokeWidth={2} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] font-mono text-slate-500">Biaxial • Threshold 4.5°</p>
        </div>

        {/* Chart 3: Vibration Geophone */}
        <div className="rounded-xl border border-mine-border bg-mine-card/90 p-4 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
              <Activity className="h-4 w-4 text-purple-400" />
              <span>Vibration ({vibSensor.id})</span>
            </div>
            <span className="font-mono text-xs font-black text-purple-300">
              {vibSensor.value} {vibSensor.unit}
            </span>
          </div>
          <div className="h-28 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={vibSensor.history || []}>
                <defs>
                  <linearGradient id="c3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A855F7" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#A855F7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <YAxis stroke="#475569" fontSize={8} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#0D131F', borderColor: '#1F2C47', fontSize: '11px' }} />
                <Area type="monotone" dataKey="value" stroke="#A855F7" fill="url(#c3)" strokeWidth={2} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] font-mono text-slate-500">Geophone • Threshold 45.0Hz</p>
        </div>

        {/* Chart 4: Strata Stress / Hydraulic Pressure */}
        <div className="rounded-xl border border-mine-border bg-mine-card/90 p-4 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
              <Gauge className="h-4 w-4 text-emerald-400" />
              <span>Strata Stress ({pressSensor.id})</span>
            </div>
            <span className="font-mono text-xs font-black text-emerald-300">
              {pressSensor.value} {pressSensor.unit}
            </span>
          </div>
          <div className="h-28 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pressSensor.history || []}>
                <defs>
                  <linearGradient id="c4" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <YAxis stroke="#475569" fontSize={8} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#0D131F', borderColor: '#1F2C47', fontSize: '11px' }} />
                <Area type="monotone" dataKey="value" stroke="#10B981" fill="url(#c4)" strokeWidth={2} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] font-mono text-slate-500">Hydraulic Cell • Threshold 38.0MPa</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-mine-border pb-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          <span className="text-slate-400 mr-2 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Sensor Type:
          </span>
          {['ALL', 'GROUND_DISPLACEMENT', 'TILT_ANGLE', 'IMU_ACCELEROMETER', 'VIBRATION', 'PRESSURE_STRESS', 'TEMPERATURE', 'HUMIDITY', 'GNSS_SURFACE_REF'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-2.5 py-1 rounded-lg transition font-bold ${
                typeFilter === t
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {t === 'ALL' ? 'All (24)' : t.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Sensor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredSensors.map((sensor) => {
          return (
            <div
              key={sensor.id}
              onClick={() => setSelectedSensor(sensor)}
              className="rounded-xl border border-mine-border bg-mine-card/90 p-4 shadow-lg hover:border-cyan-500/50 cursor-pointer transition-all hover:scale-[1.01] space-y-3 font-mono"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-slate-800 p-2 text-cyan-400">
                    <Radio className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{sensor.id}</h3>
                    <p className="text-[10px] text-slate-400">{sensor.type?.replace(/_/g, ' ')}</p>
                  </div>
                </div>
                {getStatusBadge(sensor)}
              </div>

              {/* Value Display */}
              <div className="rounded-lg bg-mine-darkest p-3 border border-slate-800/80 flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Current Telemetry</span>
                  <span className="text-2xl font-black text-white">{sensor.value}</span>
                  <span className="text-xs font-bold text-cyan-400 ml-1">{sensor.unit}</span>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  <span>{sensor.zone}</span>
                  <span className="block text-slate-500">{sensor.tunnelId}</span>
                </div>
              </div>

              {/* Sparkline & Battery Footer */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                <div className="flex items-center gap-1.5">
                  <Battery className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{sensor.battery}%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Wifi className="h-3.5 w-3.5 text-cyan-400" />
                  <span>{sensor.signal} ({sensor.rssi}dBm)</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
