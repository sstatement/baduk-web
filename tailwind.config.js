/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'bg-dark': '#0b0f14',
        'accent-blue': '#3b82f6',
        'accent-lime': '#a3e635',
        'card-bg': 'rgba(30,41,59,0.7)',
      },
      boxShadow: {
        neon: '0 0 15px rgba(59,130,246,0.6)',
        neonHover: '0 0 25px rgba(59,130,246,0.9)',
      },
      backgroundImage: {
        'grid-pattern':
          'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)',
      },
    },
  },
  plugins: [],
};
