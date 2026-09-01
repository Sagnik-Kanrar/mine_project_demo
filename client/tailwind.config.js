/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        mine: {
          darkest: '#080C14',
          dark: '#0D131F',
          card: '#131B2E',
          cardHover: '#1A243D',
          border: '#1F2C47',
          borderLight: '#2D3F66',
          subtle: '#64748B',
          text: '#E2E8F0',
          heading: '#F8FAFC',
        },
        hazard: {
          safe: '#10B981',       // Emerald green
          safeBg: 'rgba(16, 185, 129, 0.12)',
          safeBorder: '#059669',
          caution: '#F59E0B',    // Amber
          cautionBg: 'rgba(245, 158, 11, 0.12)',
          cautionBorder: '#D97706',
          warning: '#F97316',    // Orange
          warningBg: 'rgba(249, 115, 22, 0.12)',
          warningBorder: '#EA580C',
          critical: '#EF4444',   // Red
          criticalBg: 'rgba(239, 68, 68, 0.15)',
          criticalBorder: '#DC2626',
          cyan: '#06B6D4',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'beacon': 'beacon 2s ease-in-out infinite',
      },
      keyframes: {
        beacon: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.35)', opacity: '0.4' },
        }
      }
    },
  },
  plugins: [],
}
