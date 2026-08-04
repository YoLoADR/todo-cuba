"use client";

import { forwardRef, type ReactNode, useEffect, useId } from "react";
import { X, type LucideIcon } from "lucide-react";
import { useFocusTrap } from "@/lib/focus-trap";
import { Button } from "./button";

interface ModalProps {
  /** Contrôle l'ouverture du modal */
  open: boolean;
  /** Callback appelé quand le modal doit se fermer */
  onClose: () => void;
  /** Titre du modal (utilisé pour aria-labelledby) */
  title: string;
  /** Contenu du modal */
  children: ReactNode;
  /** Pied de page optionnel */
  footer?: ReactNode;
}

/**
 * Composant Modal du design system Merenza.
 *
 * Caractéristiques :
 * - Overlay semi-transparent (bg-black/50)
 * - Centré, border radius 8px (rounded-lg)
 * - Fermeture : clic overlay, Escape, bouton X
 * - Accessibilité : role=dialog, aria-modal=true, aria-labelledby
 * - Focus trap : le focus reste dans le modal
 * - Tailwind : bg-mrz-bg-elevated, border-mrz-border, text-mrz-text
 *
 * @example
 * ```tsx
 * <Modal open={isOpen} onClose={() => setIsOpen(false)} title="Nouvelle tâche">
 *   <p>Contenu du modal</p>
 * </Modal>
 * ```
 */
export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ open, onClose, title, children, footer }, ref) => {
    const titleId = useId();
    const modalRef = useFocusTrap<HTMLDivElement>(open);

    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          onClose();
        }
      };

      if (open) {
        document.addEventListener("keydown", handleKeyDown);
      }
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [open, onClose]);

    if (!open) return null;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        onClick={onClose}
        data-testid="modal-overlay"
      >
        <div
          ref={(node) => {
            if (typeof ref === "function") ref(node);
            if (modalRef.current) modalRef.current = node;
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="w-full max-w-md rounded-lg border border-mrz-border bg-mrz-bg-elevated p-6 text-mrz-text shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4">
            <h2 id={titleId} className="text-lg font-medium">
              {title}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              aria-label="Fermer"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
          <div className="mt-4">
            {children}
          </div>
          {footer && <div className="mt-6">{footer}</div>}
        </div>
      </div>
    );
  }
);

Modal.displayName = "Modal";