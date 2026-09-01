import React from 'react';

export const RiskBadge = ({ level, size = 'md', showPulse = true }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-semibold',
    md: 'px-2.5 py-1 text-xs font-bold tracking-wide',
    lg: 'px-3.5 py-1.5 text-sm font-bold tracking-wider',
  };

  const styleConfig = {
    SAFE: {
      bg: 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400',
      dot: 'bg-emerald-400',
      label: 'SAFE',
    },
    CAUTION: {
      bg: 'bg-amber-950/60 border-amber-500/50 text-amber-300',
      dot: 'bg-amber-400',
      label: 'CAUTION',
    },
    WARNING: {
      bg: 'bg-orange-950/60 border-orange-500/50 text-orange-300',
      dot: 'bg-orange-400',
      label: 'WARNING',
    },
    CRITICAL: {
      bg: 'bg-red-950/80 border-red-500/80 text-red-300 animate-pulse',
      dot: 'bg-red-500 shadow-[0_0_8px_#ef4444]',
      label: 'CRITICAL',
    },
  };

  const conf = styleConfig[level] || styleConfig.SAFE;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${conf.bg} ${sizeClasses[size]} uppercase shadow-sm transition-all`}
    >
      <span
        className={`h-2 w-2 rounded-full ${conf.dot} ${showPulse && level === 'CRITICAL' ? 'animate-ping' : ''}`}
      />
      {conf.label}
    </span>
  );
};
