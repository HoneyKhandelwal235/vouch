import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        vouch: {
          accent: "#2D5BFF",
          card: "#161616",
          dark: "#0A0A0A",
          border: "#27272A",
        }
      },
    },
  },
  plugins: [],
};
export default config;