import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brandBlue: {
          DEFAULT: "#1A73E8",
          dark: "#1557B0",
          light: "#E8F0FE",
        },
        brandDark: {
          DEFAULT: "#0D1B2A",
          darker: "#050C16",
          light: "#1B263B",
          card: "#112233",
        },
        brandGreen: "#34A853",
        brandYellow: "#FBBC04",
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
        marquee2: 'marquee2 40s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        marquee2: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0%)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
