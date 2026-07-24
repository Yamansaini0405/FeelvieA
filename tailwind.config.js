/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#12101A",
          900: "#1B1826",
          800: "#272233",
        },
        surface: {
          50: "#FAF9FC",
          100: "#F3F1F8",
          200: "#E9E6F2",
        },
        brand: {
          50: "#F1EEFE",
          100: "#E3DCFD",
          300: "#B4A3F8",
          500: "#7C5CF0",
          600: "#6A47DE",
          700: "#5836BE",
        },
        coral: {
          400: "#FF7A8A",
          500: "#FF5C71",
        },
        ok: "#1E9E6A",
        warn: "#D98E04",
        danger: "#E24C4C",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Sora", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(18, 16, 26, 0.04), 0 8px 24px -8px rgba(18, 16, 26, 0.08)",
        pop: "0 20px 45px -12px rgba(18, 16, 26, 0.35)",
      },
      borderRadius: {
        xl2: "1.1rem",
      },
    },
  },
  plugins: [],
};
