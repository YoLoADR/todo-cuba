import type { ReactNode } from "react";

/**
 * Props du composant PageHeader.
 */
interface PageHeaderProps {
  /** Titre principal (h1) */
  title: string;
  /** Description optionnelle sous le titre */
  description?: string;
  /** Action optionnelle à droite (bouton, toggle, etc.) */
  action?: ReactNode;
}

/**
 * Composant PageHeader du design system Merenza.
 *
 * Caractéristiques :
 * - Hiérarchie des headings (h1)
 * - Bordure inférieure (bordures > ombres)
 * - Principe de précision
 *
 * @example
 * ```tsx
 * <PageHeader
 *   title="Mes tâches"
 *   description="Gérez vos tâches avec le Kanban"
 *   action={<Button variant="primary" icon={Plus}>Nouvelle tâche</Button>}
 * />
 * ```
 */
export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4 border-b border-mrz-border pb-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-mrz-text">{title}</h1>
        {description && (
          <p className="text-sm text-mrz-text-muted">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}