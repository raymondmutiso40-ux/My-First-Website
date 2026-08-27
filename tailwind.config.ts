import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        kazi: {
          green: "#0F9D58",
          amber: "#F4B400",
          red: "#DB4437",
          ink: "#101828",
          muted: "#667085",
        },
        stamp: {
          navy: "#12181B",
          paper: "#F6F1E7",
          paperDim: "#EDE6D6",
          red: "#B23A2E",
          green: "#2F7A4D",
          amber: "#D98E2B",
          ivory: "#EDEAE2",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-plex-sans)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      backgroundImage: {
        "paper-grain":
          "radial-gradient(circle at 20% 20%, rgba(18,24,27,0.035) 0, transparent 45%), radial-gradient(circle at 80% 60%, rgba(18,24,27,0.03) 0, transparent 40%)",
      },
    },
  },
  plugins: [],
};

export default config;
