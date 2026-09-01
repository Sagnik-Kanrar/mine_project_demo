import React, { useState } from 'react';
import { useMine } from '../context/MineContext';
import {
  Search,
  MapPin,
  Clock,
  Radio,
  Eye,
  CheckCircle2,
} from 'lucide-react';

export const AlertsPage = () => {
  const { alerts = [], acknowledgeAlert, resolveAlert, setActivePage, setSelectedTunnel, tunnels = [] } = useMine();

  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAlerts = alerts.filter((a) => {
    const matchesSeverity = severityFilter === 'ALL' || a.severity === severityFilter;
    const matchesSearch =
      (a.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'CRITICAL':
        return (
          <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-red-950 text-red-300 border border-red-500/80 animate-pulse">
            🔴 CRITICAL
          </span>
        );
      case 'WARNING':
        return (
          <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-orange-950 text-orange-300 border border-orange-500/50">
            🟠 WARNING
          </span>
        );
      case 'CAUTION':
        return (
          <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-500/50">
            🟡 CAUTION
          </span>
        );
      case 'INFO':
      default:
        return (
          <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            🔵 INFO
          </span>
        );
    }
  };

  const handleViewOnMap = (location) => {
    const matchedTunnel = tunnels.find((t) => location && location.includes(t.id));
    if (matchedTunnel) {
      setSelectedTunnel(matchedTunnel);
    }
    setActivePage('map');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-mono text-2xl font-black tracking-tight text-white">
              INCIDENT & ALERT MANAGEMENT
            </h1>
            <span className="font-mono text-xs bg-red-950 text-red-300 px-2.5 py-0.5 rounded border border-red-500/40 font-bold">
              {alerts.filter((a) => !a.resolved).length} ACTIVE INCIDENTS
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            DGMS Safety Audit Log, Real-Time Sensor Trigger History & Emergency Dispatch Records
          </p>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-mine-border bg-mine-card/90 p-4">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search incident title, tunnel ID, or sensor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-mine-border bg-mine-darkest pl-9 pr-4 py-2 font-mono text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
          {['ALL', 'CRITICAL', 'WARNING', 'CAUTION', 'INFO'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                severityFilter === sev
                  ? 'bg-cyan-600 text-white shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {sev === 'ALL' ? `All (${alerts.length})` : sev}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="rounded-xl border border-mine-border bg-mine-card/90 p-12 text-center text-slate-500 font-mono text-xs">
            No incident records match your current filter.
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            return (
              <div
                key={alert.id}
                className={`rounded-xl border p-5 shadow-xl transition-all space-y-3 font-mono text-xs ${
                  alert.resolved
                    ? 'bg-mine-card/60 border-slate-800/80 opacity-75'
                    : alert.severity === 'CRITICAL'
                    ? 'bg-red-950/30 border-red-500/60 shadow-red-950/40'
                    : alert.severity === 'WARNING'
                    ? 'bg-amber-950/20 border-amber-500/40'
                    : 'bg-mine-card/90 border-mine-border'
                }`}
              >
                {/* Top Row: Severity, Title, Timestamp */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {getSeverityBadge(alert.severity)}
                    <strong className="text-white text-sm font-sans">{alert.title}</strong>
                  </div>

                  <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-500" />
                      {new Date(alert.timestamp).toLocaleTimeString()} IST
                    </span>
                    <span className="text-slate-500">{alert.id}</span>
                  </div>
                </div>

                {/* Body Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-lg bg-mine-darkest/90 p-3 border border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] block">LOCATION</span>
                    <span className="text-slate-200 font-bold flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                      {alert.location} ({alert.zone})
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[10px] block">TRIGGER SENSOR</span>
                    <span className="text-cyan-300 font-bold flex items-center gap-1">
                      <Radio className="h-3.5 w-3.5 text-cyan-400" />
                      {alert.sensorId || 'System Core'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[10px] block">STATUS</span>
                    <span
                      className={`font-bold ${
                        alert.resolved ? 'text-emerald-400' : alert.acknowledged ? 'text-amber-300' : 'text-red-400'
                      }`}
                    >
                      {alert.resolved ? '✓ RESOLVED' : alert.acknowledged ? 'ACKNOWLEDGED' : 'PENDING ACTION'}
                    </span>
                  </div>
                </div>

                <p className="text-slate-300 font-sans text-xs leading-relaxed">{alert.description}</p>

                {/* Required Action & Resolution Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
                  <div className="text-slate-400 text-xs">
                    <strong className="text-amber-400">Action Required:</strong> {alert.actionRequired}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewOnMap(alert.location)}
                      className="flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 px-3 py-1.5 font-bold transition border border-slate-700"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View on Map
                    </button>

                    {!alert.acknowledged && (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="rounded-lg bg-amber-950/80 hover:bg-amber-900 text-amber-200 border border-amber-500/40 px-3 py-1.5 font-bold transition"
                      >
                        Acknowledge
                      </button>
                    )}

                    {!alert.resolved && (
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-500/40 px-3 py-1.5 font-bold transition"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
