import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        paper: "#fff8df",
        ink: "#21180f",
        muted: "#735f46",
        line: "#21180f",
        steel: "#5b4a36",
        bone: "#fffdf3"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"]
      },
      boxShadow: {
        quiet: "8px 8px 0 rgba(33, 24, 15, 0.92)"
      }
    }
  },
  plugins: []
};

export default config;
