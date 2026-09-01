import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { X, Radio, Battery, Wifi, Activity, Clock } from 'lucide-react';

export const SensorDetailModal = ({ sensor, onClose }) => {
  if (!sensor) return null;

  const isOffline = sensor.status === 'OFFLINE';

  const getStatusColor = () => {
    if (isOffline) return 'text-slate-400 border-slate-600 bg-slate-900';
    if (sensor.status === 'CRITICAL') return 'text-red-400 border-red-500 bg-red-950/80 animate-pulse';
    if (sensor.status === 'WARNING') return 'text-amber-400 border-amber-500 bg-amber-950/80';
    return 'text-emerald-400 border-emerald-500 bg-emerald-950/60';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-mine-border bg-mine-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-mine-border/80 bg-slate-900/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-slate-800 p-2 text-cyan-400">
              <Radio className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-lg font-black text-white">{sensor.id}</h3>
                <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-full border ${getStatusColor()}`}>
                  {sensor.status}
                </span>
              </div>
              <p className="text-xs text-slate-400">{sensor.name}</p>
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
          {/* Main Reading Card */}
          <div className="rounded-xl border border-mine-border/80 bg-slate-900/60 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Real-Time Telemetry Value</span>
              <span className="font-mono text-xs text-slate-400">
                Zone: <strong className="text-white">{sensor.zone}</strong> • Tunnel:{' '}
                <strong className="text-white">{sensor.tunnelId}</strong>
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-mono text-3xl font-black text-white">{sensor.value}</span>
              <span className="font-mono text-lg font-bold text-cyan-400">{sensor.unit}</span>
            </div>

            {/* Threshold Progress Bar */}
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>Caution: {sensor.thresholds?.caution}{sensor.unit}</span>
                <span>Warning: {sensor.thresholds?.warning}{sensor.unit}</span>
                <span>Critical: {sensor.thresholds?.critical}{sensor.unit}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden flex">
                <div className="h-full bg-emerald-500" style={{ width: '35%' }} />
                <div className="h-full bg-amber-500" style={{ width: '35%' }} />
                <div className="h-full bg-red-500" style={{ width: '30%' }} />
              </div>
            </div>
          </div>

          {/* Real-time Rolling Waveform */}
          <div className="rounded-xl border border-mine-border/80 bg-slate-900/60 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                <Activity className="h-4 w-4 text-cyan-400" />
                <span>Live Time-Series Waveform</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">Last 15 telemetry ticks</span>
            </div>
            <div className="h-36 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sensor.history || []}>
                  <XAxis dataKey="timestamp" stroke="#475569" fontSize={9} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={9} tickLine={false} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0D131F', borderColor: '#1F2C47', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#06B6D4"
                    strokeWidth={2}
                    dot={{ fill: '#06B6D4', r: 2 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Hardware & Transmission Health */}
          <div className="grid grid-cols-3 gap-2 font-mono text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <div className="flex items-center gap-1 text-slate-400 mb-1">
                <Battery className="h-3.5 w-3.5 text-emerald-400" />
                <span>Battery</span>
              </div>
              <p className="font-bold text-white text-base">{sensor.battery}%</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <div className="flex items-center gap-1 text-slate-400 mb-1">
                <Wifi className="h-3.5 w-3.5 text-cyan-400" />
                <span>LoRa Signal</span>
              </div>
              <p className="font-bold text-white text-base">{sensor.rssi} dBm</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <div className="flex items-center gap-1 text-slate-400 mb-1">
                <Clock className="h-3.5 w-3.5 text-amber-400" />
                <span>Transmission</span>
              </div>
              <p className="font-bold text-white text-xs">{sensor.signal}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-mine-border/80 bg-slate-900/60 px-6 py-3 text-right">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-2 font-mono text-xs font-bold text-white hover:bg-slate-700 transition"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
