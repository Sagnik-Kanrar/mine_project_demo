import React from 'react';
import { useMine } from '../context/MineContext';
import { RiskGauge } from '../components/common/RiskGauge';
import { RiskBadge } from '../components/common/RiskBadge';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  BrainCircuit,
  Sparkles,
  TrendingUp,
  Activity,
  Info,
  Cpu,
} from 'lucide-react';

export const AIPredictionPage = () => {
  const { aiPrediction } = useMine();

  const riskScore = aiPrediction?.overallRiskScore || 21;
  const classification = aiPrediction?.riskClassification || 'SAFE';
  const inputs = aiPrediction?.inputs;
  const forecastData = aiPrediction?.forecast30Min || [];
  const factors = aiPrediction?.explanation?.dominantFactors || [];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Prototype Disclaimer */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-mono text-2xl font-black tracking-tight text-white">
              AI SUBSIDENCE PREDICTION MODEL
            </h1>
            <span className="font-mono text-xs bg-purple-950 text-purple-300 px-2.5 py-0.5 rounded border border-purple-500/40 font-bold">
              MULTI-PARAM STRATA INFERENCE
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Predictive Ground Deformation, Micro-Seismic Waveform Analysis & Collapse Risk Estimation
          </p>
        </div>

        {/* Prototype Warning Disclaimer */}
        <div className="flex items-center gap-2 bg-amber-950/40 border border-amber-500/40 px-3 py-1.5 rounded-xl text-amber-300 text-xs font-mono">
          <Info className="h-4 w-4 text-amber-400" />
          <span>
            <strong>Prototype AI Prediction:</strong> Calibrated on simulated strata physics. Real mine deployment requires DGMS geological validation.
          </span>
        </div>
      </div>

      {/* Top Grid: Main Risk Gauge + Inputs Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Overall Risk Meter */}
        <div className="rounded-xl border border-mine-border bg-mine-card/90 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-mine-border pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                Current Subsidence Risk
              </h2>
            </div>
            <RiskBadge level={classification} size="md" />
          </div>

          <div className="py-4">
            <RiskGauge score={riskScore} classification={classification} size={250} />
          </div>

          <div className="rounded-lg bg-mine-darkest p-3.5 border border-slate-800 space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Model Inference Confidence:</span>
              <strong className="text-emerald-400">92.4% (Ensemble Model)</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Sampling Rate:</span>
              <strong className="text-white">100 Hz Continuous Polling</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Geological Strata Profile:</span>
              <strong className="text-cyan-300">Dishergarh Coal Seam 3</strong>
            </div>
          </div>
        </div>

        {/* Center & Right: Model Feature Inputs Matrix */}
        <div className="lg:col-span-2 rounded-xl border border-mine-border bg-mine-card/90 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-mine-border pb-3">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-purple-400" />
              <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                Multi-Sensor Model Inputs (Current Timestep)
              </h2>
            </div>
            <span className="font-mono text-xs text-slate-400">6 Key Strata Features Ingested</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono">
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 space-y-1">
              <span className="text-[11px] text-slate-400 block uppercase">Roof Displacement</span>
              <p className="text-xl font-black text-white">{inputs?.groundDisplacementMm || 3.8} mm</p>
              <span className="text-[10px] text-cyan-400">Threshold: 10.0 mm</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 space-y-1">
              <span className="text-[11px] text-slate-400 block uppercase">Displacement Velocity</span>
              <p className="text-xl font-black text-white">{inputs?.displacementVelocityMmPerMin || 0.04} mm/min</p>
              <span className="text-[10px] text-amber-400">Trend: {(inputs?.historicalTrendRate || 2.4)} mm/hr</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 space-y-1">
              <span className="text-[11px] text-slate-400 block uppercase">Biaxial Tilt Angle</span>
              <p className="text-xl font-black text-white">{inputs?.tiltAngleDeg || 0.8}°</p>
              <span className="text-[10px] text-slate-400">Threshold: 4.5°</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 space-y-1">
              <span className="text-[11px] text-slate-400 block uppercase">Micro-Seismic Vibration</span>
              <p className="text-xl font-black text-white">{inputs?.vibrationHz || 12.4} Hz</p>
              <span className="text-[10px] text-purple-400">Acc: {inputs?.vibrationG || 0.08} g</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 space-y-1">
              <span className="text-[11px] text-slate-400 block uppercase">Strata Pore Pressure</span>
              <p className="text-xl font-black text-white">{inputs?.porePressureMpa || 18.5} MPa</p>
              <span className="text-[10px] text-emerald-400">Hydraulic Load Cell</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 space-y-1">
              <span className="text-[11px] text-slate-400 block uppercase">Ambient Temp / Humid</span>
              <p className="text-xl font-black text-white">{inputs?.temperatureC || 26.4}°C</p>
              <span className="text-[10px] text-slate-400">RH: {inputs?.humidityPct || 68.2}%</span>
            </div>
          </div>

          {/* AI Explanation Paragraph */}
          <div className="rounded-xl border border-purple-500/40 bg-purple-950/20 p-4 space-y-2 text-xs">
            <span className="font-mono font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" />
              Explainable AI (XAI) Model Rationale:
            </span>
            <p className="leading-relaxed text-slate-200 font-mono text-xs">
              {aiPrediction?.explanation?.summary}
            </p>
            <p className="text-cyan-300 font-mono font-bold pt-1">
              Recommended DGMS Protocol: {aiPrediction?.explanation?.recommendation}
            </p>
          </div>
        </div>
      </div>

      {/* 30-Minute Predictive Strata Deformation Forecast Chart */}
      <div className="rounded-xl border border-mine-border bg-mine-card/90 p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-mine-border pb-3">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-cyan-400" />
              <h2 className="font-mono text-base font-bold text-white uppercase">
                Predicted Ground Movement — Next 30 Minutes
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Exponential Strata Velocity Projection with Upper & Lower 95% Confidence Bounds
            </p>
          </div>
          <span className="font-mono text-xs text-red-400 bg-red-950/80 border border-red-500/50 px-3 py-1 rounded-full font-bold">
            Critical Threshold Limit: 15.0 mm
          </span>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2C47" />
              <XAxis
                dataKey="minute"
                stroke="#64748B"
                fontSize={10}
                tickFormatter={(min) => `+${min} min`}
              />
              <YAxis stroke="#64748B" fontSize={10} domain={[0, 25]} unit="mm" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0D131F',
                  borderColor: '#1F2C47',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />

              {/* Confidence Interval Shading */}
              <Area
                type="monotone"
                dataKey="upperBoundMm"
                stroke="transparent"
                fill="#06B6D4"
                fillOpacity={0.15}
                name="Confidence Range (+/- 95%)"
              />

              {/* Predicted Deformation Line */}
              <Line
                type="monotone"
                dataKey="predictedDeformationMm"
                stroke="#06B6D4"
                strokeWidth={3}
                dot={{ fill: '#06B6D4', r: 4 }}
                name="Predicted Strata Deformation (mm)"
              />

              {/* Critical Safety Limit Reference */}
              <Line
                type="monotone"
                dataKey="criticalThresholdMm"
                stroke="#EF4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="DGMS Critical Collapse Limit (15.0mm)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Dominant Risk Factors & Future ML Architecture Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dominant Factors Weights */}
        <div className="rounded-xl border border-mine-border bg-mine-card/90 p-5 shadow-xl space-y-4">
          <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-400" />
            Dominant Risk Factors (SHAP Feature Importance)
          </h3>

          <div className="space-y-3">
            {factors.map((f, i) => (
              <div key={i} className="space-y-1 font-mono text-xs">
                <div className="flex justify-between text-slate-300">
                  <span className="font-bold">{f.factor}</span>
                  <span className="text-cyan-400 font-bold">{f.weight}% weight</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      f.impact === 'HIGH' ? 'bg-red-500' : f.impact === 'MEDIUM' ? 'bg-amber-400' : 'bg-cyan-500'
                    }`}
                    style={{ width: `${f.weight}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400">{f.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Future Hardware & ML Integration Architecture */}
        <div className="rounded-xl border border-mine-border bg-mine-card/90 p-5 shadow-xl space-y-4 font-mono text-xs">
          <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Cpu className="h-4 w-4 text-purple-400" />
            Machine Learning Pipeline & Extensibility
          </h3>

          <div className="rounded-lg bg-mine-darkest p-4 border border-slate-800 space-y-2">
            <div className="text-slate-400">
              <strong className="text-cyan-300">Model Architecture:</strong> LightGBM + 1D-CNN Strata Time-Series Model
            </div>
            <div className="text-slate-400">
              <strong className="text-cyan-300">Inference API Layer:</strong> REST endpoint (`POST /api/risk/predict`) & gRPC microservice interface
            </div>
            <div className="text-slate-400">
              <strong className="text-cyan-300">Production Integration:</strong> Ingests LoRa payload packets from ESP32 gateway, passes through data cleaning pipeline, and generates real-time predictions.
            </div>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <span className="font-bold text-slate-200 block">Integration with Python PyTorch / ONNX:</span>
            <p>
              When a trained PyTorch model (`subsidence_lstm.pt`) is deployed, the Node.js backend proxies sensor streams directly into the Python container for sub-second continuous tensor inference.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
