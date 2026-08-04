"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * Hook pour piéger le focus dans un élément.
 * Utilisé pour les modals et autres composants qui nécessitent un focus trap.
 *
 * @param active - Si vrai, active le focus trap
 * @returns RefObject à attacher à l'élément conteneur
 */
export function useFocusTrap<T extends HTMLElement>(active: boolean = true): RefObject<T | null> {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!active || !ref.current) return;

    const container = ref.current;
    const focusableElements = container.querySelectorAll<
      HTMLElement
    >(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      if (event.shiftKey && document.activeElement === firstElement) {
        lastElement?.focus();
        event.preventDefault();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        firstElement?.focus();
        event.preventDefault();
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    
    // Focus le premier élément focusable
    if (firstElement) {
      firstElement.focus();
    } else {
      container.focus();
    }

    return () => {
      container.removeEventListener("keydown", handleKeyDown);
    };
  }, [active]);

  return ref;
}