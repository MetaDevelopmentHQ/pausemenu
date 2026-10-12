/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: "var(--accent)",
        "accent-ink": "var(--accent-ink)",
        base: "#0B0B0D",
        ink: "#F2F2F2",
        muted: "#8A8F98",
      },
      fontFamily: {
        display: ["Rajdhani", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
  // FiveM CEF: blur/filter/backdrop are not allowed -> disable these utilities entirely
  corePlugins: {
    filter: false, blur: false, brightness: false, contrast: false, dropShadow: false, grayscale: false,
    hueRotate: false, invert: false, saturate: false, sepia: false,
    backdropFilter: false, backdropBlur: false, backdropBrightness: false, backdropContrast: false,
    backdropGrayscale: false, backdropHueRotate: false, backdropInvert: false, backdropOpacity: false,
    backdropSaturate: false, backdropSepia: false,
  },
  plugins: [],
};
