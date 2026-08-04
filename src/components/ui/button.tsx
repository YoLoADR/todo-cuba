import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

/**
 * Variantes de bouton du design system Merenza.
 */
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

/**
 * Tailles de bouton.
 */
type ButtonSize = "sm" | "md";

/**
 * Props du composant Button.
 */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Variante visuelle */
  variant?: ButtonVariant;
  /** Taille du bouton */
  size?: ButtonSize;
  /** Icône lucide-react à afficher avant le texte */
  icon?: LucideIcon;
  /** Texte du bouton (aria-label si icon-only) */
  children?: ReactNode;
}

/**
 * Map des variantes vers les classes Tailwind Merenza.
 * Bordures > ombres. Pas d'ombres en dark mode.
 */
const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-amber-500 text-zinc-900 border border-amber-500 hover:bg-amber-400 hover:border-amber-400",
  secondary:
    "bg-transparent text-mrz-text border border-mrz-border hover:border-mrz-text-muted",
  ghost:
    "bg-transparent text-mrz-text-muted border border-transparent hover:text-mrz-text hover:bg-mrz-bg-elevated",
  danger:
    "bg-transparent text-mrz-danger border border-mrz-danger hover:bg-mrz-danger hover:text-zinc-900",
};

/**
 * Map des tailles vers les classes Tailwind.
 * Border radius : 6px pour les interactifs (rounded-md = 6px).
 */
const sizeClasses: Record<ButtonSize, string> = {
  sm: "text-xs px-3 py-1.5 gap-1.5",
  md: "text-sm px-4 py-2 gap-2",
};

/**
 * Composant Button du design system Merenza.
 *
 * Caractéristiques :
 * - Bordures > ombres (pas d'ombres)
 * - Border radius 6px (interactif)
 * - Focus ring : ring-2 ring-amber-500/50 ring-offset-2
 * - Icônes lucide-react avec currentColor
 * - Accessibilité : aria-label pour boutons icon-only
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md" icon={Plus}>Nouvelle tâche</Button>
 * <Button variant="ghost" size="sm" icon={Trash} aria-label="Supprimer" />
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "secondary", size = "md", icon: Icon, children, className = "", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-mrz-bg disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";