/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: { colors: {
      'primary-bg': '#0d1b2a',
      'input-bg': '#415a77',
      'placeholder-color': '#9ca3af',
      'border-color': '#e0e1dd',
    },
  },
  },
  plugins: [],
};
