"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/providers/theme-provider";
import { Button } from "@/components/ui/button";

/**
 * Bouton de bascule de thème dark/light.
 *
 * Utilise le hook useTheme et affiche l'icône Sun (en dark) ou Moon (en light).
 * Icônes lucide-react avec currentColor.
 *
 * @example
 * ```tsx
 * <ThemeToggle />
 * ```
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      icon={theme === "dark" ? Sun : Moon}
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Activer le thème clair" : "Activer le thème sombre"}
    >
      <span className="sr-only">
        {theme === "dark" ? "Thème sombre actif" : "Thème clair actif"}
      </span>
    </Button>
  );
}