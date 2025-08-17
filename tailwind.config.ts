import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
	],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        heading: ["var(--font-heading)", "var(--font-sans)", "sans-serif"],
      },
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--bg)",
        foreground: "var(--text)",
        surface: "var(--surface)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--on-primary)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--on-secondary)",
        },
        destructive: {
          DEFAULT: "var(--error)",
          foreground: "var(--on-primary)",
        },
        muted: {
          DEFAULT: "var(--surface)",
          foreground: "var(--text)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--on-accent)",
        },
        popover: {
          DEFAULT: "var(--surface)",
          foreground: "var(--text)",
        },
        card: {
          DEFAULT: "var(--surface)",
          foreground: "var(--text)",
        },
        info: "var(--info)",
        success: "var(--success)",
        warning: "var(--warning)",
        error: "var(--error)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2xl": "1rem", // As requested
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      boxShadow: {
        soft: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
