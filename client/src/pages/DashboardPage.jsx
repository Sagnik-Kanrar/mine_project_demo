import React from 'react';
import { useMine } from '../context/MineContext';
import { KPICard } from '../components/common/KPICard';
import { RiskBadge } from '../components/common/RiskBadge';
import { RiskGauge } from '../components/common/RiskGauge';
import { MineMapCanvas } from '../components/map/MineMapCanvas';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import {
  Activity,
  Radio,
  HardHat,
  AlertTriangle,
  DoorOpen,
  Shield,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const DashboardPage = () => {
  const {
    sensors = [],
    workers = [],
    tunnels = [],
    nodes = [],
    alerts = [],
    aiPrediction,
    simulationState,
    activeRoutePlan,
    setSelectedTunnel,
    setSelectedWorker,
    setSelectedSensor,
    setActivePage,
    acknowledgeAlert,
    selectedZoneFilter,
  } = useMine();

  // Metrics
  const activeSensorsCount = sensors.filter((s) => s.status !== 'OFFLINE').length;
  const totalSensorsCount = sensors.length;
  const workersUnderground = workers.length;
  const activeAlertsCount = alerts.filter((a) => !a.resolved).length;
  const safeExitsCount = nodes.filter((n) => n.isExit && n.isOpen).length;
  const totalExitsCount = nodes.filter((n) => n.isExit).length;

  const currentRisk = aiPrediction?.riskClassification || 'SAFE';
  const riskScore = aiPrediction?.overallRiskScore || 21;

  // Key Sensor Data for Charts
  const displacementSensor = sensors.find((s) => s.id === 'SENS-001') || sensors[0] || { value: 3.8, unit: 'mm', history: [] };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Title & Status Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-mono text-2xl font-black tracking-tight text-white">COMMAND DASHBOARD</h1>
            <RiskBadge level={currentRisk} size="md" />
          </div>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Real-Time Strata Telemetry, AI Subsidence Risk & Intelligent Safe Evacuation Routing
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActivePage('evacuation')}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-4 py-2 text-xs font-mono font-bold shadow-lg shadow-cyan-950 transition"
          >
            <Shield className="h-4 w-4" />
            Evacuation Route Navigator →
          </button>
        </div>
      </div>

      {/* Top 6 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <KPICard
          title="Mine Status"
          value={simulationState?.emergencyModeActive ? 'EMERGENCY' : 'MONITORING'}
          subtitle="DGMS Compliance Sec-44"
          icon={Activity}
          variant={simulationState?.emergencyModeActive ? 'critical' : 'safe'}
        />

        <KPICard
          title="Active Sensors"
          value={`${activeSensorsCount} / ${totalSensorsCount}`}
          subtitle="LoRaWAN 868MHz Mesh"
          icon={Radio}
          variant={activeSensorsCount < totalSensorsCount ? 'caution' : 'safe'}
          onClick={() => setActivePage('sensors')}
        />

        <KPICard
          title="Miners Underground"
          value={workersUnderground}
          subtitle="UWB / BLE Tagged"
          icon={HardHat}
          variant="cyan"
          onClick={() => setActivePage('workers')}
        />

        <KPICard
          title="Current Risk"
          value={currentRisk}
          subtitle={`Score: ${riskScore} / 100`}
          icon={AlertTriangle}
          variant={currentRisk === 'CRITICAL' ? 'critical' : currentRisk === 'WARNING' ? 'warning' : currentRisk === 'CAUTION' ? 'caution' : 'safe'}
          onClick={() => setActivePage('ai-prediction')}
        />

        <KPICard
          title="Active Alerts"
          value={activeAlertsCount}
          subtitle={activeAlertsCount > 0 ? 'Requires Action' : 'All Clear'}
          icon={AlertTriangle}
          variant={activeAlertsCount > 0 ? 'warning' : 'safe'}
          onClick={() => setActivePage('alerts')}
        />

        <KPICard
          title="Safe Exits"
          value={`${safeExitsCount} / ${totalExitsCount}`}
          subtitle="Incline & Shafts Open"
          icon={DoorOpen}
          variant={safeExitsCount < totalExitsCount ? 'caution' : 'safe'}
          onClick={() => setActivePage('map')}
        />
      </div>

      {/* Main Grid: Live Map + AI Prediction Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Mine Map */}
        <div className="lg:col-span-2 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                Live 2D Underground Mine Map
              </h2>
            </div>
            <button
              onClick={() => setActivePage('map')}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              Full Interactive View <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <MineMapCanvas
            nodes={nodes}
            tunnels={tunnels}
            sensors={sensors}
            workers={workers}
            activeRoutePlan={activeRoutePlan}
            onSelectTunnel={setSelectedTunnel}
            onSelectWorker={setSelectedWorker}
            onSelectSensor={setSelectedSensor}
            zoneFilter={selectedZoneFilter}
            height={460}
          />
        </div>

        {/* Right Col: AI Subsidence Score & Explainable AI */}
        <div className="space-y-4">
          <div className="rounded-xl border border-mine-border bg-mine-card/90 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-mine-border pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                  AI Subsidence Risk Score
                </h3>
              </div>
              <span className="font-mono text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                PROTOTYPE ML MODEL
              </span>
            </div>

            {/* Gauge */}
            <div className="py-2">
              <RiskGauge score={riskScore} classification={currentRisk} size={220} />
            </div>

            {/* Core Feature Parameters List */}
            <div className="space-y-2 rounded-lg bg-mine-darkest p-3 border border-slate-800 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Ground Displacement:</span>
                <strong className="text-white">{aiPrediction?.inputs?.groundDisplacementMm || 3.8} mm</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Deformation Velocity:</span>
                <strong className="text-white">{aiPrediction?.inputs?.displacementVelocityMmPerMin || 0.04} mm/min</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Roof Tilt Angle:</span>
                <strong className="text-white">{aiPrediction?.inputs?.tiltAngleDeg || 0.8}°</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Micro-Seismic Vibration:</span>
                <strong className="text-white">{aiPrediction?.inputs?.vibrationHz || 12.4} Hz</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Strata Stress / Pressure:</span>
                <strong className="text-white">{aiPrediction?.inputs?.porePressureMpa || 18.5} MPa</strong>
              </div>
            </div>

            {/* AI Explanation Snippet */}
            <div className="rounded-lg bg-cyan-950/30 border border-cyan-500/30 p-3 text-xs text-slate-300 space-y-1">
              <span className="font-bold font-mono text-cyan-300 block">AI Diagnostic Insight:</span>
              <p className="text-[11px] leading-relaxed text-slate-300">
                {aiPrediction?.explanation?.summary || 'Strata stability nominal. Normal rock mechanical balance maintained.'}
              </p>
            </div>

            <button
              onClick={() => setActivePage('ai-prediction')}
              className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 p-2 font-mono text-xs font-bold transition border border-slate-700"
            >
              Inspect 30-Min Deformation Forecast →
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Real-time Telemetry Charts + Workers + Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Sensor Charts */}
        <div className="rounded-xl border border-mine-border bg-mine-card/90 p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-mine-border pb-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-400" />
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                Strata Displacement Telemetry (SENS-001)
              </h3>
            </div>
            <span className="font-mono text-xs font-bold text-cyan-300">
              {displacementSensor.value} {displacementSensor.unit}
            </span>
          </div>

          <div className="h-48 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displacementSensor.history || []}>
                <defs>
                  <linearGradient id="dispGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="timestamp" stroke="#475569" fontSize={9} tickLine={false} />
                <YAxis stroke="#475569" fontSize={9} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0D131F', borderColor: '#1F2C47', borderRadius: '8px', fontSize: '11px' }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#06B6D4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#dispGrad)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] font-mono text-slate-500 text-center">
            Warning threshold: 10.0mm • Critical: 15.0mm
          </p>
        </div>

        {/* Worker Status Quick Table */}
        <div className="rounded-xl border border-mine-border bg-mine-card/90 p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-mine-border pb-2">
            <div className="flex items-center gap-2">
              <HardHat className="h-4 w-4 text-amber-400" />
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                Underground Workforce Status ({workers.length})
              </h3>
            </div>
            <button
              onClick={() => setActivePage('workers')}
              className="text-[11px] font-mono text-cyan-400 hover:underline"
            >
              View Grid →
            </button>
          </div>

          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {workers.slice(0, 5).map((w) => (
              <div
                key={w.id}
                onClick={() => setSelectedWorker(w)}
                className="flex items-center justify-between rounded-lg bg-slate-900/80 p-2.5 border border-slate-800 hover:border-cyan-500/50 cursor-pointer text-xs font-mono transition"
              >
                <div>
                  <strong className="text-slate-200 block">{w.name}</strong>
                  <span className="text-[11px] text-slate-400">{w.zone} • {w.id}</span>
                </div>
                <div className="text-right">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      w.status === 'SAFE'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-950 text-amber-300 border border-amber-500/40 animate-pulse'
                    }`}
                  >
                    {w.status}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Exit {w.assignedExitId} ({w.distanceToExit}m)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Alerts Feed */}
        <div className="rounded-xl border border-mine-border bg-mine-card/90 p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-mine-border pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                Recent Incident Alerts
              </h3>
            </div>
            <button
              onClick={() => setActivePage('alerts')}
              className="text-[11px] font-mono text-cyan-400 hover:underline"
            >
              All Alerts →
            </button>
          </div>

          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {alerts.slice(0, 4).map((a) => (
              <div
                key={a.id}
                className="rounded-lg bg-slate-900/80 p-2.5 border border-slate-800 space-y-1 text-xs font-mono"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                      a.severity === 'CRITICAL'
                        ? 'bg-red-950 text-red-300 border border-red-500/40'
                        : a.severity === 'WARNING'
                        ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {a.severity}
                  </span>
                  <span className="text-[10px] text-slate-500">{a.location}</span>
                </div>
                <p className="font-bold text-slate-200 text-xs">{a.title}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400">{a.actionRequired}</span>
                  {!a.acknowledged && (
                    <button
                      onClick={() => acknowledgeAlert(a.id)}
                      className="text-[10px] bg-slate-800 text-cyan-300 px-2 py-0.5 rounded hover:bg-slate-700 transition font-bold"
                    >
                      Ack
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
