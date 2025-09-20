/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // or 'media' for OS preference-based dark mode
  theme: {
    extend: {
      colors: {
        primary: {
          main: '#FF3B30',
          light: '#FF6B60',
          dark: '#D32F2F',
        },
        secondary: {
          main: '#333333',
          light: '#444444',
          dark: '#222222',
        },
        neutral: {
          black: '#121212',
          darkGrey: '#1C1C1E',
          grey: '#666666',
          lightGrey: '#C4C4C4',
          veryLightGrey: '#E0E0E0',
          white: '#FFFFFF',
          background: '#121212', // Dark background
        },
        dark: {
          100: '#333333',
          200: '#252525',
          300: '#1E1E1E',
          400: '#181818',
          500: '#121212',
          600: '#0D0D0D',
          700: '#080808',
          800: '#050505',
          900: '#020202',
        },
        accent: {
          blue: '#3366FF',
          purple: '#9966FF',
          teal: '#33CCCC',
        },
        status: {
          success: '#34C759',
          successDark: '#16A34A',
          warning: '#FFCC00',
          error: '#FF3B30',
          info: '#4682B4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        md: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-in-out',
        'slide-down': 'slideDown 0.6s ease-in-out',
        'slide-left': 'slideLeft 0.6s ease-in-out',
        'slide-right': 'slideRight 0.6s ease-in-out',
        'bounce-slow': 'bounce 3s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(255, 59, 48, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(255, 59, 48, 0.8)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'dark-gradient': 'linear-gradient(to bottom, #121212, #181818)',
        'hero-pattern': "url('/assets/images/hero-pattern.svg')",
      },
      backdropFilter: {
        'none': 'none',
        'blur': 'blur(20px)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
