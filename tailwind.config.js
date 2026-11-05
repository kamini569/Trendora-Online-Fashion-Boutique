/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#F8F5EF',
        espresso: '#302820',
        taupe: '#B7A99A',
        gold: '#B69A65',
        ink: '#1B1712',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      letterSpacing: {
        widest: '0.22em',
        mega: '0.34em',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.75rem',
        '6xl': '3.5rem',
      },
      transitionTimingFunction: {
        soft: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        marqueeL: {
          '0%': { transform: 'translate3d(0,0,0)' },
          '100%': { transform: 'translate3d(-33.3333%,0,0)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translate3d(0,16px,0)' },
          '100%': { opacity: '1', transform: 'translate3d(0,0,0)' },
        },
      },
      animation: {
        marqueeL: 'marqueeL 46s linear infinite',
        fadeUp: 'fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both',
      },
    },
  },
  plugins: [],
};
