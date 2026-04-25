import { createContext, useContext } from "react";

const ThemeContext = createContext();
export function useTheme() { return useContext(ThemeContext); }
export { ThemeContext };

export const themes = {
  light: {
    bg: "#F5F0EB", bgAlt: "#FFFFFF", bgCard: "#FFFFFF",
    text: "#1C1917", textSoft: "#78716C", textMuted: "#A8A29E", textFaint: "#D6D3D1",
    accent: "#D97706", accentSoft: "#D9770615", accentBorder: "#D9770625", accentHover: "#B45309",
    border: "#E7E5E4", borderSoft: "#F5F5F4",
    shadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
    shadowHover: "0 8px 30px rgba(0,0,0,0.08)",
    navBg: "rgba(245,240,235,0.85)", grain: 0.03,
    overlayBg: "rgba(245,240,235,0.95)", isDark: false,
  },
  dark: {
    bg: "#0C0A09", bgAlt: "#1C1917", bgCard: "#1C1917",
    text: "#FAFAF9", textSoft: "#A8A29E", textMuted: "#78716C", textFaint: "#44403C",
    accent: "#F59E0B", accentSoft: "#F59E0B15", accentBorder: "#F59E0B25", accentHover: "#FBBF24",
    border: "#292524", borderSoft: "#1C1917",
    shadow: "0 1px 3px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.15)",
    shadowHover: "0 8px 30px rgba(0,0,0,0.3)",
    navBg: "rgba(12,10,9,0.85)", grain: 0.05,
    overlayBg: "rgba(12,10,9,0.95)", isDark: true,
  },
};
