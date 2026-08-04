import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

/**
 * Props du composant EmptyState.
 */
interface EmptyStateProps {
  /** Icône à afficher (lucide-react) */
  icon: LucideIcon;
  /** Titre principal */
  title: string;
  /** Description optionnelle */
  description?: string;
  /** Action optionnelle (bouton, lien, etc.) */
  action?: ReactNode;
}

/**
 * Composant EmptyState du design system Merenza.
 *
 * Caractéristiques :
 * - Icône lucide-react avec currentColor
 * - Principe de précision : pas de décoration gratuite
 * - Accessibilité : role=status pour annoncer l'état vide
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={Inbox}
 *   title="Aucune tâche"
 *   description="Créez votre première tâche"
 *   action={<Button>Créer</Button>}
 * />
 * ```
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 p-8 text-center"
      role="status"
      aria-live="polite"
    >
      <Icon
        className="h-12 w-12 text-mrz-text-muted"
        aria-hidden="true"
      />
      <div className="space-y-1">
        <h3 className="text-base font-medium text-mrz-text">{title}</h3>
        {description && (
          <p className="text-sm text-mrz-text-muted">{description}</p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}