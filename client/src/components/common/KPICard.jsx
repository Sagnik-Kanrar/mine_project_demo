import React from 'react';

export const KPICard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  badge,
  trend,
  onClick,
}) => {
  const variantStyles = {
    default: 'border-mine-border/80 hover:border-slate-600 bg-mine-card/90 text-slate-100',
    safe: 'border-emerald-500/30 hover:border-emerald-500/60 bg-gradient-to-br from-mine-card via-mine-card to-emerald-950/20 text-slate-100',
    caution: 'border-amber-500/40 hover:border-amber-500/70 bg-gradient-to-br from-mine-card via-mine-card to-amber-950/30 text-amber-200',
    warning: 'border-orange-500/40 hover:border-orange-500/70 bg-gradient-to-br from-mine-card via-mine-card to-orange-950/30 text-orange-200',
    critical: 'border-red-500/60 hover:border-red-500 bg-gradient-to-br from-mine-card via-mine-card to-red-950/40 text-red-200 animate-pulse-slow',
    cyan: 'border-cyan-500/40 hover:border-cyan-500/70 bg-gradient-to-br from-mine-card via-mine-card to-cyan-950/30 text-cyan-200',
  };

  const iconColors = {
    default: 'text-slate-400 bg-slate-800/80',
    safe: 'text-emerald-400 bg-emerald-950/80 border border-emerald-500/30',
    caution: 'text-amber-400 bg-amber-950/80 border border-amber-500/30',
    warning: 'text-orange-400 bg-orange-950/80 border border-orange-500/30',
    critical: 'text-red-400 bg-red-950/80 border border-red-500/40',
    cyan: 'text-cyan-400 bg-cyan-950/80 border border-cyan-500/30',
  };

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border p-4 shadow-lg backdrop-blur transition-all duration-200 ${variantStyles[variant]} ${
        onClick ? 'cursor-pointer hover:scale-[1.01]' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-black tracking-tight text-white font-mono">{value}</h3>
            {badge && <div>{badge}</div>}
          </div>
          {subtitle && <p className="text-xs text-slate-400 font-medium">{subtitle}</p>}
          {trend && <p className="text-[11px] font-mono text-slate-400 pt-0.5">{trend}</p>}
        </div>
        {Icon && (
          <div className={`rounded-lg p-2.5 shadow-sm ${iconColors[variant]}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
};
