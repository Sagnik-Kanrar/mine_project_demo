import React from 'react';

export const StatusIndicator = ({ status, label, className = '' }) => {
  const getStyle = () => {
    switch (status) {
      case 'ONLINE':
      case 'NORMAL':
      case 'MONITORING':
        return { dot: 'bg-emerald-400', text: 'text-emerald-400', glow: 'shadow-[0_0_8px_#10b981]' };
      case 'WARNING':
        return { dot: 'bg-amber-400', text: 'text-amber-300', glow: 'shadow-[0_0_8px_#f59e0b]' };
      case 'CRITICAL':
      case 'TRAPPED':
      case 'EVACUATING':
        return { dot: 'bg-red-500 animate-ping', text: 'text-red-400', glow: 'shadow-[0_0_12px_#ef4444]' };
      case 'OFFLINE':
      default:
        return { dot: 'bg-slate-500', text: 'text-slate-400', glow: '' };
    }
  };

  const s = getStyle();

  return (
    <div className={`inline-flex items-center gap-2 font-mono text-xs font-semibold ${s.text} ${className}`}>
      <span className={`h-2.5 w-2.5 rounded-full ${s.dot} ${s.glow}`} />
      <span>{label || status}</span>
    </div>
  );
};
