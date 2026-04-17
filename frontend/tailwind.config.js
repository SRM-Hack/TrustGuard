module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        truthguard: {
          red: "#DC2626",
          orange: "#D97706",
          green: "#16A34A",
          blue: "#2563EB",
          indigo: "#4F46E5",
          dark: "#0F172A",
          navy: "#1E3A5F",
          light: "#F8FAFC",
        },
        surface: {
          glass: "rgba(255,255,255,0.72)",
          "glass-dark": "rgba(15,23,42,0.80)",
          "glass-blue": "rgba(37,99,235,0.12)",
        },
      },
      fontFamily: {
        display: ["Sora", "sans-serif"],
        body: ["DM Sans", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 6px -1px rgba(0,0,0,0.04), 0 10px 40px -10px rgba(17,24,39,0.12), inset 0 1px 0 rgba(255,255,255,0.9)",
        "card-hover": "0 20px 60px -10px rgba(37,99,235,0.20), 0 4px 6px -1px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
        btn: "0 8px 25px rgba(37,99,235,0.30), inset 0 1px 0 rgba(255,255,255,0.20)",
        "btn-hover": "0 16px 40px rgba(37,99,235,0.40)",
        "glow-green": "0 0 30px rgba(22,163,74,0.35)",
        "glow-red": "0 0 30px rgba(220,38,38,0.35)",
        "glow-orange": "0 0 30px rgba(217,119,6,0.35)",
        "glow-blue": "0 0 30px rgba(37,99,235,0.35)",
        float: "0 25px 50px -12px rgba(0,0,0,0.15)",
        "inner-glow": "inset 0 2px 6px rgba(0,0,0,0.05)",
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      backdropBlur: {
        xs: '4px',
        xl: '24px',
        '2xl': '40px',
      },
      animation: {
        'float-3d': 'float3d 6s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2.5s ease-in-out infinite',
        'spin-slow': 'spin-slow 8s linear infinite',
        'fade-in-up': 'fade-in-up 0.4s ease both',
        shimmer: 'shimmer 1.5s ease-in-out infinite',
        blob: 'blob 7s infinite',
      },
      keyframes: {
        float3d: {
          '0%, 100%': { transform: 'translateY(0) rotateX(0) rotateY(0)' },
          '50%': { transform: 'translateY(-15px) rotateX(5deg) rotateY(3deg)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: 0.6, transform: 'scale(1)' },
          '50%': { opacity: 0.9, transform: 'scale(1.05)' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'fade-in-up': {
          from: { opacity: 0, transform: 'translateY(15px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(20px, -40px) scale(1.1)' },
          '66%': { transform: 'translate(-15px, 15px) scale(0.95)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
