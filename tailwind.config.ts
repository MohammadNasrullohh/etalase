import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        serif: ['Poppins', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      colors: {
        canvas: {
          DEFAULT: "var(--color-canvas)",
          raised: "var(--color-canvas-raised)",
        },
        surface: {
          DEFAULT: "var(--color-surface)",
          raised: "var(--color-surface-raised)",
          overlay: "var(--color-surface-overlay)",
        },
        ink: "var(--color-ink)",
        token: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-inverse-muted)",
          muted: "var(--color-text-muted)",
          accent: "var(--color-accent)",
          "accent-hover": "var(--color-accent-hover)",
          "accent-focus": "var(--color-accent-focus)",
          "border-subtle": "var(--glass-border-subtle)",
          "border-default": "var(--glass-border-default)",
          "border-bright": "var(--glass-border-bright)",
        },
      },
      borderColor: {
        subtle: "var(--glass-border-subtle)",
        default: "var(--glass-border-default)",
        bright: "var(--glass-border-bright)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
