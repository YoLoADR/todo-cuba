import type { ReactNode } from "react";

/**
 * Variantes de Badge du design system Merenza.
 * Utilise des couleurs + labels pour ne pas porter l'info uniquement par la couleur.
 */
type BadgeVariant =
  | "default"
  | "low"
  | "medium"
  | "high"
  | "todo"
  | "in-progress"
  | "done"
  | "count";

/**
 * Props du composant Badge.
 */
interface BadgeProps {
  /** Variante visuelle */
  variant?: BadgeVariant;
  /** Contenu du badge */
  children: ReactNode;
  /** Classe additionnelle */
  className?: string;
}

/**
 * Map des variantes vers les classes Tailwind.
 * Border radius : rounded-full (badges).
 * Bordures > ombres.
 */
const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-mrz-bg-elevated text-mrz-text-muted border-mrz-border",
  low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  high: "bg-red-500/10 text-red-400 border-red-500/30",
  todo: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30",
  "in-progress": "bg-blue-500/10 text-blue-400 border-blue-500/30",
  done: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  count: "bg-mrz-bg-elevated text-mrz-text-muted border-mrz-border",
};

/**
 * Composant Badge du design system Merenza.
 *
 * Caractéristiques :
 * - Border radius : rounded-full
 * - Bordures > ombres
 * - Couleurs + labels (pas d'info uniquement par la couleur)
 * - Variantes pour priorité, statut et compteur
 *
 * @example
 * ```tsx
 * <Badge variant="high">Haute</Badge>
 * <Badge variant="done">Terminé</Badge>
 * <Badge variant="count">3</Badge>
 * ```
 */
export function Badge({
  variant = "default",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}