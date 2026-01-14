/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#009EE0',     // Azul Brillante
        secondary: '#0055A5',   // Azul Profundo
        background: '#FFFFFF',  // Blanco
        text: '#000000',        // Negro
      },
      fontFamily: {
        sans: ['Inter', 'Montserrat', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
