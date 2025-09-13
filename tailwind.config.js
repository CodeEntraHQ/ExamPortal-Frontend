/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Modern Green Primary Palette - Works great in both light & dark themes
        primary: {
          50: '#f0fdf4',   // Very light green - perfect for backgrounds
          100: '#dcfce7',  // Light green - subtle highlights
          200: '#bbf7d0',  // Soft green - borders, dividers
          300: '#86efac',  // Medium light green - hover states
          400: '#4ade80',  // Vibrant green - accents
          500: '#22c55e',  // Main brand green - primary actions
          600: '#16a34a',  // Darker green - primary hover
          700: '#15803d',  // Deep green - text, icons
          800: '#166534',  // Very dark green - headings
          900: '#14532d',  // Darkest green - emphasis
          950: '#052e16',  // Almost black green - strong contrast
        },
        // Modern Neutral Secondary Palette - Complements green perfectly
        secondary: {
          50: '#f8fafc',   // Almost white - light backgrounds
          100: '#f1f5f9',  // Very light gray - subtle backgrounds
          200: '#e2e8f0',  // Light gray - borders, dividers
          300: '#cbd5e1',  // Medium light gray - disabled states
          400: '#94a3b8',  // Medium gray - secondary text
          500: '#64748b',  // Base gray - body text
          600: '#475569',  // Dark gray - headings
          700: '#334155',  // Darker gray - strong text
          800: '#1e293b',  // Very dark gray - dark backgrounds
          900: '#0f172a',  // Almost black - darkest backgrounds
          950: '#020617',  // Pure dark - maximum contrast
        },
        // Semantic Colors - Using green variations
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        info: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'float': 'float 20s ease-in-out infinite',
        'float2': 'float2 26s ease-in-out infinite',
        'float3': 'float3 32s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '50%': { transform: 'translate3d(-10px, 10px, 0) scale(1.05)' },
        },
        float2: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '50%': { transform: 'translate3d(12px, -12px, 0) scale(1.08)' },
        },
        float3: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '50%': { transform: 'translate3d(-8px, -6px, 0) scale(0.98)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}