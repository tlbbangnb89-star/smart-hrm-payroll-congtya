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
        forest: {
          900: '#0B1E16',
          800: '#0F291E', // Sidebar Xanh Rừng Sâu
          700: '#163B2C',
          600: '#1F4D3A',
        },
        navy: {
          900: '#0F172A',
          800: '#1E3A8A', // Xanh Hải Quân
          700: '#1D4ED8',
        },
        gold: {
          500: '#F59E0B',
          600: '#D97706', // Điểm nhấn Vàng Đồng
          700: '#B45309',
        },
        porcelain: '#F8FAFC', // Trắng Sứ
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' }
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(217, 119, 6, 0.4)' },
          '50%': { boxShadow: '0 0 25px rgba(217, 119, 6, 0.8)' }
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
