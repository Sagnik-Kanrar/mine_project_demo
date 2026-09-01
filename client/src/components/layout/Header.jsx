import React, { useState, useEffect } from 'react';
import { useMine } from '../../context/MineContext';
import {
  Menu,
  Volume2,
  VolumeX,
  Bell,
  Clock,
  Filter,
  Building2,
} from 'lucide-react';

export const Header = ({ onToggleMobileMenu }) => {
  const {
    zones,
    alerts,
    selectedZoneFilter,
    setSelectedZoneFilter,
    isMuted,
    toggleMute,
    isConnected,
    setActivePage,
  } = useMine();

  const [currentTime, setCurrentTime] = useState('');
  const [showAlertDropdown, setShowAlertDropdown] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }) + ' IST'
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const unreadAlerts = alerts.filter((a) => !a.resolved);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-mine-border/80 bg-mine-darkest/90 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Mobile Toggle & Mine Selector */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onToggleMobileMenu}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden transition"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Mine Facility Badge */}
        <div className="hidden sm:flex items-center gap-2 rounded-xl bg-slate-900/90 border border-slate-800 px-3 py-1.5 text-xs font-mono">
          <Building2 className="h-4 w-4 text-cyan-400" />
          <span className="font-bold text-slate-200">ECL Raniganj Coalfield</span>
          <span className="text-slate-500">•</span>
          <span className="text-cyan-400 font-semibold">Underground Seam 3</span>
        </div>

        {/* Zone Filter Dropdown */}
        <div className="flex items-center gap-1.5 text-xs">
          <Filter className="h-3.5 w-3.5 text-slate-400 hidden md:inline" />
          <select
            value={selectedZoneFilter}
            onChange={(e) => setSelectedZoneFilter(e.target.value)}
            className="rounded-lg border border-mine-border bg-mine-card px-2.5 py-1.5 font-mono text-xs font-semibold text-slate-200 focus:border-cyan-500 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Mine Zones (A–D)</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: Telemetry Health, Clock, Audio & Notifications */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Real-time Clock */}
        <div className="hidden md:flex items-center gap-2 rounded-lg bg-slate-900/80 px-3 py-1.5 border border-slate-800 font-mono text-xs text-slate-300">
          <Clock className="h-3.5 w-3.5 text-cyan-400" />
          <span className="font-bold">{currentTime}</span>
        </div>

        {/* IoT Live Stream Badge */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="flex h-2.5 w-2.5 relative">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isConnected ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isConnected ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
          </span>
          <span className="hidden sm:inline text-slate-300 font-bold">
            {isConnected ? 'IoT Telemetry Live' : 'Reconnecting...'}
          </span>
        </div>

        {/* Audio Mute/Unmute */}
        <button
          onClick={toggleMute}
          className={`rounded-xl p-2 text-xs font-mono transition border ${
            isMuted
              ? 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
              : 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60'
          }`}
          title={isMuted ? 'Unmute Audio Alarms' : 'Mute Audio Alarms'}
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowAlertDropdown(!showAlertDropdown)}
            className="relative rounded-xl border border-mine-border bg-mine-card p-2 text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            <Bell className="h-4 w-4" />
            {unreadAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 font-mono text-[9px] font-black text-white shadow-[0_0_8px_#ef4444]">
                {unreadAlerts.length}
              </span>
            )}
          </button>

          {/* Quick Alert Feed Dropdown */}
          {showAlertDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-mine-border bg-mine-card shadow-2xl p-4 space-y-3 z-50 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-mine-border/80 pb-2">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-cyan-400" />
                  <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                    Live Incident Alerts ({unreadAlerts.length})
                  </h4>
                </div>
                <button
                  onClick={() => {
                    setShowAlertDropdown(false);
                    setActivePage('alerts');
                  }}
                  className="text-[11px] font-mono text-cyan-400 hover:underline"
                >
                  View All →
                </button>
              </div>

              <div className="max-h-64 space-y-2 overflow-y-auto">
                {unreadAlerts.length === 0 ? (
                  <p className="text-xs text-slate-500 font-mono italic py-2 text-center">
                    No unacknowledged alerts.
                  </p>
                ) : (
                  unreadAlerts.slice(0, 5).map((a) => (
                    <div
                      key={a.id}
                      className="rounded-lg bg-slate-900/90 p-2.5 border border-slate-800 space-y-1 text-xs font-mono hover:border-slate-700"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-bold text-[10px] px-1.5 py-0.2 rounded uppercase ${
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
                      <p className="text-[11px] text-slate-400">{a.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
