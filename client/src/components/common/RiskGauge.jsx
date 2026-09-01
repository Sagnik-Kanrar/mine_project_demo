import React from 'react';

export const RiskGauge = ({
  score,
  classification,
  size = 200,
  showLabels = true,
}) => {
  // Semi-circle gauge calculation
  const clampedScore = Math.min(100, Math.max(0, score || 0));
  const radius = 70;
  const strokeWidth = 14;
  const circumference = Math.PI * radius; // Half-circle arc length
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  // Needle angle (-90deg to +90deg)
  const needleAngle = -90 + (clampedScore / 100) * 180;

  const getColor = () => {
    switch (classification) {
      case 'CRITICAL':
        return '#EF4444';
      case 'WARNING':
        return '#F97316';
      case 'CAUTION':
        return '#F59E0B';
      case 'SAFE':
      default:
        return '#10B981';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center relative">
      <svg
        width={size}
        height={size * 0.65}
        viewBox="0 0 180 115"
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="35%" stopColor="#F59E0B" />
            <stop offset="70%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
          <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background track */}
        <path
          d="M 20 95 A 70 70 0 0 1 160 95"
          fill="none"
          stroke="#1F2C47"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Active colored arc */}
        <path
          d="M 20 95 A 70 70 0 0 1 160 95"
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
          filter="url(#gaugeGlow)"
        />

        {/* Needle indicator */}
        <g transform="translate(90, 95)">
          <g
            transform={`rotate(${needleAngle})`}
            style={{ transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          >
            <polygon points="-3,0 3,0 0,-62" fill="#FFFFFF" opacity="0.9" />
            <circle cx="0" cy="0" r="6" fill="#0D131F" stroke="#FFFFFF" strokeWidth="2" />
          </g>
        </g>

        {/* Zone markers */}
        {showLabels && (
          <>
            <text x="20" y="110" fontSize="9" fill="#10B981" fontWeight="bold" textAnchor="middle">
              0%
            </text>
            <text x="90" y="32" fontSize="8" fill="#F59E0B" fontWeight="600" textAnchor="middle">
              50%
            </text>
            <text x="160" y="110" fontSize="9" fill="#EF4444" fontWeight="bold" textAnchor="middle">
              100%
            </text>
          </>
        )}
      </svg>

      {/* Score Center Text */}
      <div className="-mt-3 text-center">
        <div className="flex items-baseline justify-center gap-1">
          <span className="font-mono text-3xl font-black tracking-tight text-white">{clampedScore}</span>
          <span className="font-mono text-lg font-bold text-slate-400">%</span>
        </div>
        <span
          className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded"
          style={{ color: getColor(), backgroundColor: `${getColor()}20` }}
        >
          {classification || 'SAFE'} RISK
        </span>
      </div>
    </div>
  );
};
