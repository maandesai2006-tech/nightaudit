import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        chassis: '#e0e5ec',
        panel: '#f0f2f5',
        muted: '#d1d9e6',
        ink: '#2d3436',
        'ink-muted': '#4a5568',
        accent: '#ff4757',
        'accent-fg': '#ffffff',
        border: '#babecc',
        'border-light': '#ffffff',
        'border-dark': '#a3b1c6',
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Roboto Mono', 'monospace'],
      },
      boxShadow: {
        'card': '8px 8px 16px #babecc, -8px -8px 16px #ffffff',
        'floating': '12px 12px 24px #babecc, -12px -12px 24px #ffffff',
        'pressed': 'inset 6px 6px 12px #babecc, inset -6px -6px 12px #ffffff',
        'recessed': 'inset 4px 4px 8px #babecc, inset -4px -4px 8px #ffffff',
        'sm-neu': '4px 4px 8px #babecc, -4px -4px 8px #ffffff',
      },
    },
  },
  plugins: [],
}

export default config
