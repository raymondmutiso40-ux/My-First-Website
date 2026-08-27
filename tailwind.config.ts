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
      },
    },
  },
  plugins: [],
};

export default config;
