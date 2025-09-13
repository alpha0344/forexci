/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
      },
      colors: {
        // Palette principale ForexCI
        'brand': {
          'yellow': '#FCEF91',
          'yellow-light': '#fdf6c4',
          'yellow-dark': '#f9e86a',
          'orange': '#FB9E3A',
          'orange-light': '#fcb366',
          'orange-dark': '#f98a14',
          'red-orange': '#E6521F',
          'red-orange-light': '#ed7146',
          'red-orange-dark': '#d63f0f',
          'red': '#EA2F14',
          'red-light': '#ef4f2f',
          'red-dark': '#d11f09',
        },
        // Couleurs fonctionnelles
        'success': {
          DEFAULT: '#10b981',
          'light': '#34d399',
          'dark': '#059669',
        },
        'warning': {
          DEFAULT: '#FB9E3A',
          'light': '#fcb366',
          'dark': '#f98a14',
        },
        'error': {
          DEFAULT: '#EA2F14',
          'light': '#ef4f2f',
          'dark': '#d11f09',
        },
        'info': {
          DEFAULT: '#3b82f6',
          'light': '#60a5fa',
          'dark': '#2563eb',
        },
        // Couleurs de texte
        'primary': '#111827',
        'secondary': '#4b5563',
        'muted': '#6b7280',
        'inverse': '#ffffff',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'brand-gradient': 'linear-gradient(135deg, #FCEF91 0%, #FB9E3A 25%, #E6521F 75%, #EA2F14 100%)',
        'brand-gradient-subtle': 'linear-gradient(135deg, #fdf6c4 0%, #fcb366 50%, #ed7146 100%)',
        'brand-gradient-card': 'linear-gradient(135deg, #ffffff 0%, #fdf6c4 100%)',
      },
      boxShadow: {
        'brand': '0 10px 15px -3px rgba(234, 47, 20, 0.1), 0 4px 6px -4px rgba(234, 47, 20, 0.1)',
        'brand-lg': '0 20px 25px -5px rgba(234, 47, 20, 0.1), 0 8px 10px -6px rgba(234, 47, 20, 0.1)',
      },
      borderColor: {
        'brand-yellow': '#FCEF91',
        'brand-orange': '#FB9E3A',
        'brand-red-orange': '#E6521F',
        'brand-red': '#EA2F14',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-in-up': 'slideInUp 0.5s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [],
}