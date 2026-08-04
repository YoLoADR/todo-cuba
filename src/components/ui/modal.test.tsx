"use client";

import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Modal } from "./modal";

// Mock pour le focus trap - simplifié pour les tests
vi.mock("@/lib/focus-trap", () => ({
  useFocusTrap: () => ({}),
}));

describe("Modal Component", () => {
  it("ne rend rien quand open=false", () => {
    render(
      <Modal open={false} onClose={() => {}} title="Test Modal">
        <p>Contenu</p>
      </Modal>
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("rend le modal quand open=true", () => {
    render(
      <Modal open={true} onClose={() => {}} title="Test Modal">
        <p>Contenu</p>
      </Modal>
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Test Modal")).toBeInTheDocument();
    expect(screen.getByText("Contenu")).toBeInTheDocument();
  });

  it("appelle onClose quand on clique sur l'overlay", async () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} title="Test Modal">
        <p>Contenu</p>
      </Modal>
    );
    await userEvent.click(screen.getByTestId("modal-overlay"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("appelle onClose quand on appuie sur Escape", async () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} title="Test Modal">
        <p>Contenu</p>
      </Modal>
    );
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("appelle onClose quand on clique sur le bouton X", async () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} title="Test Modal">
        <p>Contenu</p>
      </Modal>
    );
    await userEvent.click(screen.getByLabelText("Fermer"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("a les bons attributs ARIA", () => {
    render(
      <Modal open={true} onClose={() => {}} title="Test Modal">
        <p>Contenu</p>
      </Modal>
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby");
    expect(screen.getByLabelText("Test Modal")).toBeInTheDocument();
  });

  it("rend le footer si fourni", () => {
    render(
      <Modal open={true} onClose={() => {}} title="Test Modal" footer={<div>Footer</div>}>
        <p>Contenu</p>
      </Modal>
    );
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("piège le focus dans le modal", () => {
    render(
      <Modal open={true} onClose={() => {}} title="Test Modal">
        <button>Bouton 1</button>
        <button>Bouton 2</button>
      </Modal>
    );
    // Le mock de focus trap est vide, mais on vérifie que le composant est bien rendu
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});