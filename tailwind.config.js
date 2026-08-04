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
        background: '#09090B',
        surface: '#18181B',
        cardCustom: '#27272A',
        borderCustom: '#3F3F46',
        primaryCustom: '#6366F1',
        successCustom: '#22C55E',
        warningCustom: '#F59E0B',
        dangerCustom: '#EF4444',
        textCustom: '#FFFFFF',
        textMuted: '#A1A1AA',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        glassSm: '0 4px 16px 0 rgba(0, 0, 0, 0.25)',
        glow: '0 0 20px rgba(99, 102, 241, 0.3)',
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
        'radial-glow': 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 60%)',
      }
    },
  },
  plugins: [],
}


