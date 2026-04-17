/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "truthguard-red": "#DC2626",
        "truthguard-orange": "#D97706",
        "truthguard-green": "#16A34A",
        "truthguard-blue": "#2563EB",
        "truthguard-dark": "#111827",
        "truthguard-light": "#F9FAFB",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
}

