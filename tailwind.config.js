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
        // Nouvelle palette principale (moderne + incendie/sécurité)
        'brand': {
          // Rouge pompier (accent principal, énergie, urgence)
          'red': '#E63946',
          'red-light': '#ea5964',
          'red-dark': '#d32f3c',
          
          // Orange sécurité (secondaire, dynamisme, chaleur)
          'orange': '#F77F00',
          'orange-light': '#f8951a',
          'orange-dark': '#e06f00',
          
          // Gris anthracite (fond sombre, sérieux, pro)
          'anthracite': '#2B2D42',
          'anthracite-light': '#3d3f5c',
          'anthracite-dark': '#1e1f2e',
          
          // Gris clair (contraste, lisibilité)
          'gray': '#EDF2F4',
          'gray-light': '#f5f8fa',
          'gray-dark': '#dde6e9',
          
          // Blanc cassé (background clair, neutralité)
          'white': '#F8F9FA',
          'white-light': '#ffffff',
          'white-dark': '#e9ecef',
          
          // Bleu confiance (optionnel, pour boutons ou éléments rassurants)
          'blue': '#1D3557',
          'blue-light': '#3a5a7a',
          'blue-dark': '#0f1d2e',
        },
        
        // Variante plus "corporate / premium" (optionnelle)
        'corporate': {
          'red': '#D62828',
          'gold': '#FFBA08',
          'navy': '#003049',
          'steel': '#6C757D',
          'white': '#FFFFFF',
        },
        
        // Couleurs fonctionnelles (adaptées à la nouvelle palette)
        'success': {
          DEFAULT: '#198754',
          'light': '#28a745',
          'dark': '#146c43',
        },
        'warning': {
          DEFAULT: '#F77F00',
          'light': '#f8951a',
          'dark': '#e06f00',
        },
        'error': {
          DEFAULT: '#E63946',
          'light': '#ea5964',
          'dark': '#d32f3c',
        },
        'info': {
          DEFAULT: '#1D3557',
          'light': '#3a5a7a',
          'dark': '#0f1d2e',
        },
        
        // Couleurs de texte (adaptées)
        'primary': '#2B2D42',      // Gris anthracite pour texte principal
        'secondary': '#6C757D',    // Gris acier pour texte secondaire
        'muted': '#868e96',        // Gris plus clair pour texte atténué
        'inverse': '#F8F9FA',      // Blanc cassé pour texte inversé
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'brand-gradient': 'linear-gradient(135deg, #E63946 0%, #F77F00 50%, #1D3557 100%)',
        'brand-gradient-subtle': 'linear-gradient(135deg, #F8F9FA 0%, #EDF2F4 50%, #F8F9FA 100%)',
        'brand-gradient-card': 'linear-gradient(135deg, #F8F9FA 0%, #EDF2F4 100%)',
        'brand-gradient-hero': 'linear-gradient(135deg, #2B2D42 0%, #1D3557 100%)',
      },
      boxShadow: {
        'brand': '0 10px 15px -3px rgba(230, 57, 70, 0.1), 0 4px 6px -4px rgba(230, 57, 70, 0.1)',
        'brand-lg': '0 20px 25px -5px rgba(230, 57, 70, 0.15), 0 8px 10px -6px rgba(230, 57, 70, 0.1)',
        'brand-orange': '0 10px 15px -3px rgba(247, 127, 0, 0.1), 0 4px 6px -4px rgba(247, 127, 0, 0.1)',
        'brand-blue': '0 10px 15px -3px rgba(29, 53, 87, 0.1), 0 4px 6px -4px rgba(29, 53, 87, 0.1)',
      },
      borderColor: {
        'brand-red': '#E63946',
        'brand-orange': '#F77F00',
        'brand-anthracite': '#2B2D42',
        'brand-gray': '#EDF2F4',
        'brand-blue': '#1D3557',
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