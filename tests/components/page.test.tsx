import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HomePage from "@/app/page";
import type { Task } from "@/lib/db/schema";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockTask: Task = {
  id: "11111111-1111-1111-1111-111111111111",
  title: "Tâche test",
  description: "Description test",
  priority: "medium",
  category: "Travail",
  status: "todo",
  dueDate: null,
  position: 0,
  createdAt: "2026-08-01T00:00:00.000Z",
  updatedAt: "2026-08-01T00:00:00.000Z",
};

const mockTasks: Task[] = [
  mockTask,
  {
    ...mockTask,
    id: "22222222-2222-2222-2222-222222222222",
    title: "Tâche urgente",
    priority: "urgent",
    status: "in-progress",
  },
];

function mockFetchResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Page d'accueil (HomePage)", () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  // --- Rendu initial ---

  it("affiche le titre 'Todo Cuba' dans le header", async () => {
    vi.mocked(global.fetch).mockResolvedValue(mockFetchResponse([]));

    render(<HomePage />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Todo Cuba");
  });

  it("affiche le bouton 'Nouvelle tâche'", async () => {
    vi.mocked(global.fetch).mockResolvedValue(mockFetchResponse([]));

    render(<HomePage />);

    expect(screen.getByText("Nouvelle tâche")).toBeInTheDocument();
  });

  it("affiche les filtres (recherche, priorité, statut)", async () => {
    vi.mocked(global.fetch).mockResolvedValue(mockFetchResponse([]));

    render(<HomePage />);

    expect(screen.getByLabelText("Recherche")).toBeInTheDocument();
    expect(screen.getByLabelText("Priorité")).toBeInTheDocument();
    expect(screen.getByLabelText("Statut")).toBeInTheDocument();
  });

  // --- Chargement des tâches ---

  it("fetch les tâches au montage et les affiche dans le KanbanBoard", async () => {
    vi.mocked(global.fetch).mockResolvedValue(mockFetchResponse(mockTasks));

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByTestId("task-card-11111111-1111-1111-1111-111111111111")).toBeInTheDocument();
    });

    expect(screen.getByTestId("task-card-22222222-2222-2222-2222-222222222222")).toBeInTheDocument();
  });

  it("affiche un message d'erreur si le fetch échoue", async () => {
    vi.mocked(global.fetch).mockRejectedValue(new Error("Network error"));

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText(/erreur/i)).toBeInTheDocument();
    });
  });

  // --- Ouverture du formulaire ---

  it("cliquer sur 'Nouvelle tâche' ouvre le modal TaskForm en mode création", async () => {
    const user = userEvent.setup();
    vi.mocked(global.fetch).mockResolvedValue(mockFetchResponse([]));

    render(<HomePage />);

    await user.click(screen.getByText("Nouvelle tâche"));

    // Le modal affiche le titre "Nouvelle tâche" (mode création) dans un h2
    await waitFor(() => {
      const headings = screen.getAllByText("Nouvelle tâche");
      // Au moins un h2 avec ce texte (le titre du modal)
      const modalTitle = headings.find(
        (el) => el.tagName === "H2",
      );
      expect(modalTitle).toBeInTheDocument();
    });
  });

  // --- Création de tâche ---

  it("soumet une nouvelle tâche via POST puis re-fetch", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.mocked(global.fetch);

    // Premier fetch : liste vide
    fetchMock.mockResolvedValueOnce(mockFetchResponse([]));
    // POST : succès
    fetchMock.mockResolvedValueOnce(mockFetchResponse(mockTask, 201));
    // Re-fetch après création
    fetchMock.mockResolvedValueOnce(mockFetchResponse([mockTask]));

    render(<HomePage />);

    // Ouvrir le formulaire
    await user.click(screen.getByText("Nouvelle tâche"));

    // Remplir le titre
    const titleInput = screen.getByLabelText("Titre");
    await user.type(titleInput, "Ma nouvelle tâche");

    // Cliquer sur Créer
    await user.click(screen.getByText("Créer"));

    // Vérifier que POST a été appelé
    await waitFor(() => {
      const postCalls = fetchMock.mock.calls.filter(
        (call) => (call[1] as RequestInit)?.method === "POST"
      );
      expect(postCalls.length).toBe(1);
      expect(postCalls[0][0]).toBe("/api/tasks");
    });

    // Vérifier que le re-fetch a eu lieu
    const getCalls = fetchMock.mock.calls.filter(
      (call) => !(call[1] as RequestInit)?.method || (call[1] as RequestInit)?.method === "GET"
    );
    expect(getCalls.length).toBeGreaterThanOrEqual(2);
  });

  // --- Édition de tâche ---

  it("cliquer sur Modifier dans le Kanban ouvre le TaskForm en mode édition", async () => {
    const user = userEvent.setup();
    vi.mocked(global.fetch).mockResolvedValue(mockFetchResponse(mockTasks));

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByTestId("edit-task-11111111-1111-1111-1111-111111111111")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("edit-task-11111111-1111-1111-1111-111111111111"));

    // Le modal doit afficher "Modifier la tâche"
    await waitFor(() => {
      expect(screen.getByText("Modifier la tâche")).toBeInTheDocument();
    });
  });

  // --- Suppression de tâche ---

  it("cliquer sur Supprimer appelle DELETE /api/tasks/:id puis re-fetch", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.mocked(global.fetch);

    fetchMock.mockResolvedValueOnce(mockFetchResponse(mockTasks));
    // DELETE
    fetchMock.mockResolvedValueOnce(mockFetchResponse(null, 204));
    // Re-fetch
    fetchMock.mockResolvedValueOnce(mockFetchResponse([]));

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByTestId("delete-task-11111111-1111-1111-1111-111111111111")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("delete-task-11111111-1111-1111-1111-111111111111"));

    await waitFor(() => {
      const deleteCalls = fetchMock.mock.calls.filter(
        (call) => (call[1] as RequestInit)?.method === "DELETE"
      );
      expect(deleteCalls.length).toBe(1);
      expect(deleteCalls[0][0]).toBe("/api/tasks/11111111-1111-1111-1111-111111111111");
    });
  });

  // --- Filtres ---

  it("change les filtres déclenche un re-fetch avec les query params", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.mocked(global.fetch);

    fetchMock.mockResolvedValue(mockFetchResponse([]));

    render(<HomePage />);

    // Changer le filtre priorité
    const prioritySelect = screen.getByLabelText("Priorité");
    await user.selectOptions(prioritySelect, "high");

    await waitFor(() => {
      const calls = fetchMock.mock.calls;
      // Au moins un appel avec ?priority=high
      const filteredCall = calls.find((call) =>
        (call[0] as string).includes("priority=high")
      );
      expect(filteredCall).toBeDefined();
    });
  });

  it("bouton Réinitialiser remet les filtres à zéro et re-fetch", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.mocked(global.fetch);

    fetchMock.mockResolvedValue(mockFetchResponse([]));

    render(<HomePage />);

    // D'abord changer un filtre
    const prioritySelect = screen.getByLabelText("Priorité");
    await user.selectOptions(prioritySelect, "high");

    // Puis réinitialiser
    await user.click(screen.getByText("Réinitialiser"));

    await waitFor(() => {
      const lastCall = fetchMock.mock.lastCall?.[0] as string;
      // Après reset, l'URL ne doit plus contenir priority
      expect(lastCall).not.toContain("priority=");
    });
  });
});
