"use client";

import { forwardRef, type SelectHTMLAttributes, useId } from "react";
import { ChevronDown } from "lucide-react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  /** Label affiché au-dessus du select */
  label?: string;
  /** Message d'erreur affiché sous le select */
  error?: string;
  /** Liste des options à afficher */
  options: SelectOption[];
}

/**
 * Composant Select du design system Merenza.
 *
 * Caractéristiques :
 * - Select natif stylé (pas de custom dropdown pour simplicité et a11y)
 * - Focus ring : ring-2 ring-amber-500/50
 * - Border radius 6px (rounded-md)
 * - Tailwind : bg-mrz-bg-elevated, border-mrz-border, text-mrz-text
 * - Label associé via htmlFor/id
 * - Message d'erreur avec role=alert
 * - Icône ChevronDown à droite (pointer-events-none)
 *
 * @example
 * ```tsx
 * <Select
 *   label="Choisissez une option"
 *   options={[ { value: "1", label: "Option 1" }, { value: "2", label: "Option 2" } ]}
 *   onChange={(e) => console.log(e.target.value)}
 * />
 * ```
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, id: propId, className = "", ...props }, ref) => {
    const generatedId = useId();
    const selectId = propId || generatedId;
    const errorId = `${selectId}-error`;
    const hintId = `${selectId}-hint`;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-mrz-text"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-describedby={error ? errorId : hintId}
            aria-invalid={!!error}
            className={`w-full appearance-none rounded-md border bg-mrz-bg-elevated px-3 py-2 text-sm text-mrz-text placeholder:text-mrz-text-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-mrz-bg disabled:opacity-50 disabled:cursor-not-allowed ${
              error ? "border-mrz-danger" : "border-mrz-border focus:border-amber-500"
            } ${className}`}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronDown
              className="h-4 w-4 text-mrz-text-muted"
              aria-hidden="true"
              data-testid="chevron-down-icon"
            />
          </div>
        </div>
        {error ? (
          <p id={errorId} role="alert" className="text-xs text-mrz-danger">
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = "Select";