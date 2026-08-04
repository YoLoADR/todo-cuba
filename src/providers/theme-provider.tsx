"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

/**
 * Thèmes disponibles dans le design system Merenza.
 */
type Theme = "dark" | "light";

/**
 * Contexte du thème.
 */
interface ThemeContextValue {
  /** Thème actuel */
  theme: Theme;
  /** Basculer entre dark et light */
  toggleTheme: () => void;
  /** Définir le thème explicitement */
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Clé de stockage du thème dans localStorage.
 */
const STORAGE_KEY = "merenza-theme";

/**
 * Provider de thème pour le design system Merenza.
 *
 * Gère :
 * - Le thème dark-first (défaut)
 * - La persistance via localStorage
 * - Le respect de prefers-color-scheme
 * - L'attribut data-theme sur <html>
 *
 * @example
 * ```tsx
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  // Lazy init: lit depuis le DOM (défini par l'anti-flash script) côté client,
  // "dark" côté serveur. Évite setState dans useEffect (lint React 19).
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    return (
      (document.documentElement.getAttribute("data-theme") as Theme) || "dark"
    );
  });

  // Sync de l'attribut data-theme quand le thème change (effet de bord sur le DOM)
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {
      // localStorage peut être indisponible (mode privé)
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext>
  );
}

/**
 * Hook pour accéder au thème depuis n'importe quel composant.
 *
 * @returns Objet contenant theme, toggleTheme et setTheme
 * @throws Erreur si utilisé en dehors d'un ThemeProvider
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme doit être utilisé dans un ThemeProvider");
  }
  return context;
}