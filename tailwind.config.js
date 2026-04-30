/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  theme: {
    extend: {
      borderRadius: {
        'xl': '12px',
        '2xl': '24px'
      },
      backdropBlur: {
        '20': '20px'
      },
      colors: {
        minimax: {
          primary: '#6366f1',
          secondary: '#8b5cf6'
        }
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.3s ease-out',
        'blink': 'blink 1s step-end infinite'
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' }
        }
      }
    }
  },
  plugins: []
}
