import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        chart: {
          background: "#0b0e11",
          panel: "#11161d",
          border: "#27313d",
          muted: "#8a96a8",
          green: "#00c076",
          red: "#ff3b30",
          amber: "#f5b544",
          cyan: "#3fd7ff"
        }
      }
    }
  },
  plugins: []
};

export default config;
