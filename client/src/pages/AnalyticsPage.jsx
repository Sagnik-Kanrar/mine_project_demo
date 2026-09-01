import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Download,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [exportSuccess, setExportSuccess] = useState(false);

  // Mock historical data series
  const deformationTrendData = [
    { day: 'Mon', zoneA: 1.2, zoneB: 3.4, zoneC: 2.1, zoneD: 1.4 },
    { day: 'Tue', zoneA: 1.3, zoneB: 3.8, zoneC: 2.2, zoneD: 1.5 },
    { day: 'Wed', zoneA: 1.4, zoneB: 4.2, zoneC: 2.5, zoneD: 1.5 },
    { day: 'Thu', zoneA: 1.6, zoneB: 4.9, zoneC: 2.8, zoneD: 1.6 },
    { day: 'Fri', zoneA: 1.8, zoneB: 5.6, zoneC: 3.1, zoneD: 1.7 },
    { day: 'Sat', zoneA: 1.9, zoneB: 7.2, zoneC: 3.2, zoneD: 1.8 },
    { day: 'Sun', zoneA: 2.1, zoneB: 8.4, zoneC: 3.2, zoneD: 1.8 },
  ];

  const evacuationDrillData = [
    { drill: 'Drill 1 (Aug 10)', standardTimeSec: 420, actualTimeSec: 360 },
    { drill: 'Drill 2 (Aug 17)', standardTimeSec: 420, actualTimeSec: 320 },
    { drill: 'Drill 3 (Aug 24)', standardTimeSec: 420, actualTimeSec: 280 },
    { drill: 'Drill 4 (Aug 31)', standardTimeSec: 420, actualTimeSec: 240 },
  ];

  const handleExport = () => {
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 4000);
  };

  return (
    <div className="space-y-6 animate-fadeIn font-mono">
      {/* Header & Date Range Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-white font-mono">
              STRATA ANALYTICS & DGMS AUDIT REPORTS
            </h1>
            <span className="text-xs bg-cyan-950 text-cyan-300 px-2.5 py-0.5 rounded border border-cyan-500/40 font-bold">
              HISTORICAL TELEMETRY INTELLIGENCE
            </span>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Longitudinal Strata Deformation Trends, Micro-Seismic Frequency Logs & Evacuation Drill Metrics
          </p>
        </div>

        {/* Range Selector & PDF Export */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-slate-900 p-1 border border-slate-800 text-xs">
            {['24h', '7d', '30d'].map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 rounded font-bold transition ${
                  timeRange === r ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500 text-cyan-300 px-4 py-2 text-xs font-bold transition shadow-sm"
          >
            <Download className="h-4 w-4" />
            Export DGMS Safety Report
          </button>
        </div>
      </div>

      {exportSuccess && (
        <div className="rounded-xl border border-emerald-500 bg-emerald-950/80 p-3 text-xs text-emerald-200 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>
            <strong>Report Generated:</strong> DGMS Mine Safety Audit Report (PDF format) compiled with 24-sensor historical logs and route optimization logs.
          </span>
        </div>
      )}

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-mine-border bg-mine-card/90 p-4 shadow-xl space-y-1">
          <span className="text-slate-400 text-xs uppercase block">Sensor Mesh Uptime</span>
          <p className="text-2xl font-black text-emerald-400">99.8%</p>
          <span className="text-[11px] text-slate-500 font-sans">LoRaWAN 868MHz packet delivery</span>
        </div>

        <div className="rounded-xl border border-mine-border bg-mine-card/90 p-4 shadow-xl space-y-1">
          <span className="text-slate-400 text-xs uppercase block">Avg Evacuation Speed</span>
          <p className="text-2xl font-black text-cyan-300">4.2 min</p>
          <span className="text-[11px] text-slate-500 font-sans">38% faster than DGMS standard</span>
        </div>

        <div className="rounded-xl border border-mine-border bg-mine-card/90 p-4 shadow-xl space-y-1">
          <span className="text-slate-400 text-xs uppercase block">Peak Ground Velocity</span>
          <p className="text-2xl font-black text-amber-300">0.95 mm/min</p>
          <span className="text-[11px] text-slate-500 font-sans">Recorded in Longwall Face LW-102</span>
        </div>

        <div className="rounded-xl border border-mine-border bg-mine-card/90 p-4 shadow-xl space-y-1">
          <span className="text-slate-400 text-xs uppercase block">AI Prediction Accuracy</span>
          <p className="text-2xl font-black text-purple-400">94.2%</p>
          <span className="text-[11px] text-slate-500 font-sans">Tested on geotechnical datasets</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Strata Deformation Trend by Zone */}
        <div className="rounded-xl border border-mine-border bg-mine-card/90 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-mine-border pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase">
                Strata Deformation Trend (7-Day Multi-Zone)
              </h3>
            </div>
            <span className="text-xs text-slate-400">Unit: mm displacement</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={deformationTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2C47" />
                <XAxis dataKey="day" stroke="#64748B" fontSize={10} />
                <YAxis stroke="#64748B" fontSize={10} domain={[0, 10]} />
                <Tooltip contentStyle={{ backgroundColor: '#0D131F', borderColor: '#1F2C47', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="zoneA" stroke="#10B981" strokeWidth={2} name="Zone A (Incline)" />
                <Line type="monotone" dataKey="zoneB" stroke="#EF4444" strokeWidth={3} name="Zone B (Longwall Face)" />
                <Line type="monotone" dataKey="zoneC" stroke="#F59E0B" strokeWidth={2} name="Zone C (Depillaring)" />
                <Line type="monotone" dataKey="zoneD" stroke="#06B6D4" strokeWidth={2} name="Zone D (Return Airway)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Evacuation Drill Progress Time */}
        <div className="rounded-xl border border-mine-border bg-mine-card/90 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-mine-border pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase">
                Evacuation Drill Response Optimization
              </h3>
            </div>
            <span className="text-xs text-slate-400">Target: &lt;420 sec</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={evacuationDrillData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2C47" />
                <XAxis dataKey="drill" stroke="#64748B" fontSize={10} />
                <YAxis stroke="#64748B" fontSize={10} unit="s" />
                <Tooltip contentStyle={{ backgroundColor: '#0D131F', borderColor: '#1F2C47', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="standardTimeSec" fill="#334155" name="Standard Target (sec)" />
                <Bar dataKey="actualTimeSec" fill="#06B6D4" name="MINEGUARD Safe Route Time (sec)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
