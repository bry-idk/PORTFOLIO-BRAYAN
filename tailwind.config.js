/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        sans: ['"Space Grotesk"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        obsidian: '#05060A',
        void: '#05060A',
        gallery: '#090B11',
        surface: '#0D1017',
        elevated: '#121621',
        neon: '#2EFF7B',
        violet: '#8B3DFF',
      },
      letterSpacing: {
        editorial: '0.24em',
        micro: '0.18em',
      },
      borderColor: {
        hairline: 'rgba(255, 255, 255, 0.09)',
        'hairline-strong': 'rgba(255, 255, 255, 0.16)',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: '0.55', transform: 'scale(0.95)' },
          '50%': { opacity: '1', transform: 'scale(1.08)' },
        },
        'curtain-line': {
          '0%': { transform: 'scaleX(0)', opacity: '0.4' },
          '60%': { transform: 'scaleX(1)', opacity: '1' },
          '100%': { transform: 'scaleX(1)', opacity: '0' },
        },
        'eq-1': {
          '0%, 100%': { transform: 'scaleY(0.35)' },
          '50%': { transform: 'scaleY(1)' },
        },
        'eq-2': {
          '0%, 100%': { transform: 'scaleY(0.95)' },
          '45%': { transform: 'scaleY(0.3)' },
        },
        'eq-3': {
          '0%, 100%': { transform: 'scaleY(0.45)' },
          '55%': { transform: 'scaleY(0.95)' },
        },
        'eq-4': {
          '0%, 100%': { transform: 'scaleY(0.75)' },
          '40%': { transform: 'scaleY(0.28)' },
        },
      },
      animation: {
        'pulse-soft': 'pulse-soft 2.6s ease-in-out infinite',
        'curtain-line': 'curtain-line 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'eq-1': 'eq-1 0.85s ease-in-out infinite',
        'eq-2': 'eq-2 0.72s ease-in-out infinite',
        'eq-3': 'eq-3 0.96s ease-in-out infinite',
        'eq-4': 'eq-4 0.78s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
