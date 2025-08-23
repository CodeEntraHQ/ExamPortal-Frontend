/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366F1',
        secondary: '#10B981',
        background: '#F3F4F6',
        neutral: '#FFFFFF',
        accent: '#F59E0B',
        error: '#F43F5E',
        text: '#1F2937',
      },
      keyframes: {
        float1: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)', opacity: '0.5' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)', opacity: '0.8' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)', opacity: '0.6' }
        },
        float2: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)', opacity: '0.6' },
          '33%': { transform: 'translate(-40px, 40px) scale(0.9)', opacity: '0.8' },
          '66%': { transform: 'translate(20px, -25px) scale(1.1)', opacity: '0.5' }
        },
        float3: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)', opacity: '0.5' },
          '33%': { transform: 'translate(25px, 25px) scale(1.1)', opacity: '0.7' },
          '66%': { transform: 'translate(-30px, -40px) scale(0.9)', opacity: '0.6' }
        }
      },
      animation: {
        float1: 'float1 12s ease-in-out infinite',
        float2: 'float2 15s ease-in-out infinite',
        float3: 'float3 18s ease-in-out infinite'
      }
    },
  },
  plugins: [],
}