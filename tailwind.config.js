/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.tsx",
    "./components/**/*.tsx",
    "./features/**/*.tsx",
    "./layouts/**/*.tsx",
    "./contexts/**/*.tsx",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['Newsreader', 'Georgia', 'serif'],
        ui: ['Archivo', 'system-ui', 'sans-serif'],
        // legacy aliases so unconverted components inherit the new faces
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Archivo', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#211A16',
        parchment: '#F6F1E7',
        paper: '#FFFDF8',
        claret: {
          DEFAULT: '#5E1A26',
          deep: '#40111B',
        },
        brass: {
          DEFAULT: '#96742E',
          soft: '#B79A5B',
        },
        vine: '#4A5D3A',
        hairline: '#E2D9C8',
        terracotta: '#B4552D',
        // legacy aliases (old components used wine/gold/cream) — mapped to new palette
        wine: { DEFAULT: '#5E1A26', dark: '#40111B', light: '#7A2433' },
        gold: { DEFAULT: '#96742E', light: '#B79A5B', dark: '#75591F' },
        cream: { DEFAULT: '#F6F1E7', dark: '#EDE5D4' },
      },
      letterSpacing: {
        kicker: '0.12em',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { from: { opacity: '0', transform: 'scale(0.98)' }, to: { opacity: '1', transform: 'scale(1)' } },
      },
    },
  },
  plugins: [],
}
