import type { ReactNode } from "react";

/**
 * Props du composant Card.
 */
interface CardProps {
  /** Contenu de la carte */
  children: ReactNode;
  /** Classe additionnelle */
  className?: string;
  /** Attribut role pour accessibilité */
  role?: string;
  /** Attribut aria-label */
  "aria-label"?: string;
}

/**
 * Composant Card du design system Merenza.
 *
 * Caractéristiques :
 * - Border radius : 8px (conteneur) → rounded-lg
 * - Bordures > ombres (pas d'ombres en dark mode)
 * - Fond élevé (--mrz-bg-elevated)
 *
 * @example
 * ```tsx
 * <Card>Contenu</Card>
 * <Card role="region" aria-label="Détails">...</Card>
 * ```
 */
export function Card({
  children,
  className = "",
  role,
  "aria-label": ariaLabel,
}: CardProps) {
  return (
    <div
      className={`rounded-lg border border-mrz-border bg-mrz-bg-elevated ${className}`}
      role={role}
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
}