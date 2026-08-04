import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

/**
 * Types d'input supportés par le composant Merenza.
 */
type InputType = "text" | "search" | "date" | "email" | "password" | "tel" | "url";

/**
 * Props du composant Input.
 */
interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Type de l'input */
  type?: InputType;
  /** Label associé à l'input */
  label?: string;
  /** Message d'erreur (affiché avec role=alert) */
  error?: string;
  /** Icône à afficher avant le texte */
  icon?: LucideIcon;
  /** Texte d'aide */
  hint?: ReactNode;
}

/**
 * Composant Input du design system Merenza.
 *
 * Caractéristiques :
 * - Bordures > ombres
 * - Border radius 6px (interactif)
 * - Focus ring : ring-2 ring-amber-500/50 ring-offset-2
 * - Label associé via htmlFor/id
 * - Erreur avec role=alert (accessibilité)
 * - Icône lucide-react avec currentColor
 *
 * @example
 * ```tsx
 * <Input label="Titre" type="text" placeholder="Nom de la tâche" />
 * <Input label="Recherche" type="search" icon={Search} />
 * <Input label="Titre" error="Le titre est requis" />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = "text",
      label,
      error,
      icon: Icon,
      hint,
      id,
      className = "",
      ...props
    },
    ref,
  ) => {
    // Génère un id si non fourni pour lier le label
    const inputId = id || props.name || `input-${Math.random().toString(36).slice(2, 9)}`;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-mrz-text"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <Icon
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mrz-text-muted"
              aria-hidden="true"
            />
          )}
          <input
            ref={ref}
            id={inputId}
            type={type}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            className={`w-full rounded-md border bg-mrz-bg-elevated px-3 py-2 text-sm text-mrz-text placeholder:text-mrz-text-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-mrz-bg disabled:opacity-50 disabled:cursor-not-allowed ${
              Icon ? "pl-10" : ""
            } ${
              error
                ? "border-mrz-danger"
                : "border-mrz-border focus:border-amber-500"
            } ${className}`}
            {...props}
          />
        </div>
        {hint && !error && (
          <p id={hintId} className="text-xs text-mrz-text-muted">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} role="alert" className="text-xs text-mrz-danger">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";