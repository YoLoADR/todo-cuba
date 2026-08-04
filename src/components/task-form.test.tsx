"use client";

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskForm from './task-form';
import { PRIORITIES, STATUSES, SUGGESTED_CATEGORIES } from '@/lib/db/schema';

// Mock pour les composants Merenza
vi.mock('@/components/ui/modal', () => ({
  Modal: ({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; footer?: React.ReactNode }) => (
    open ? (
      <div data-testid="modal">
        <h2>{title}</h2>
        <button onClick={onClose} data-testid="modal-close">Close</button>
        {children}
        {footer && <div data-testid="modal-footer">{footer}</div>}
      </div>
    ) : null
  ),
}));

vi.mock('@/components/ui/input', () => ({
  Input: ({ label, error, hint, type, id, name, ...props }: { label?: string; error?: string; hint?: string; type?: string; id?: string; name?: string; [key: string]: any }) => {
    // Génère un id si non fourni pour lier le label
    const inputId = id || name || `input-${Math.random().toString(36).slice(2, 9)}`;
    return (
      <div>
        {label && <label htmlFor={inputId}>{label}</label>}
        <input id={inputId} type={type || 'text'} name={name} {...props} />
        {hint && <div data-testid="hint">{hint}</div>}
        {error && <div data-testid="error">{error}</div>}
      </div>
    );
  },
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({ label, error, options, value, onChange, id, name }: { label?: string; error?: string; options: { value: string; label: string }[]; value?: string; onChange?: React.ChangeEventHandler<HTMLSelectElement>; id?: string; name?: string }) => {
    // Génère un id si non fourni pour lier le label
    const selectId = id || name || `select-${Math.random().toString(36).slice(2, 9)}`;
    return (
      <div>
        {label && <label htmlFor={selectId}>{label}</label>}
        <select id={selectId} name={name} value={value} onChange={onChange}>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <div data-testid="error">{error}</div>}
      </div>
    );
  },
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ variant, size, children, ...props }: { variant: 'primary' | 'secondary' | 'ghost' | 'danger'; size: 'sm' | 'md'; children: React.ReactNode; [key: string]: any }) => (
    <button {...props} data-testid={`button-${variant}`}>
      {children}
    </button>
  ),
}));

describe('TaskForm', () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    onSubmit: mockOnSubmit,
    mode: 'create' as const,
  };

  const sampleTask = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Test Task',
    description: 'Test Description',
    priority: 'high' as const,
    category: 'Travail',
    status: 'in-progress' as const,
    dueDate: '2026-12-31',
    position: 0,
    createdAt: '2026-08-01T00:00:00Z',
    updatedAt: '2026-08-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rend le formulaire en mode création avec le titre et bouton appropriés', () => {
    render(<TaskForm {...defaultProps} />);
    
    expect(screen.getByText('Nouvelle tâche')).toBeInTheDocument();
    expect(screen.getByTestId('button-primary')).toHaveTextContent('Créer');
  });

  it('rend le formulaire en mode édition avec le titre et bouton appropriés', () => {
    render(<TaskForm {...defaultProps} mode="edit" initialData={sampleTask} />);
    
    expect(screen.getByText('Modifier la tâche')).toBeInTheDocument();
    expect(screen.getByTestId('button-primary')).toHaveTextContent('Modifier');
  });

  it('affiche tous les champs requis en mode création', () => {
    render(<TaskForm {...defaultProps} />);
    
    expect(screen.getByLabelText('Titre')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Priorité')).toBeInTheDocument();
    expect(screen.getByLabelText('Catégorie')).toBeInTheDocument();
    expect(screen.getByLabelText('Date d\'échéance')).toBeInTheDocument();
    
    // Le champ statut ne doit pas être affiché en mode création
    expect(screen.queryByLabelText('Statut')).not.toBeInTheDocument();
  });

  it('affiche le champ statut en mode édition', () => {
    render(<TaskForm {...defaultProps} mode="edit" initialData={sampleTask} />);
    
    expect(screen.getByLabelText('Statut')).toBeInTheDocument();
  });

  it('pré-remplit les champs avec initialData en mode édition', () => {
    render(<TaskForm {...defaultProps} mode="edit" initialData={sampleTask} />);
    
    expect(screen.getByLabelText('Titre')).toHaveValue('Test Task');
    expect(screen.getByLabelText('Description')).toHaveValue('Test Description');
    expect(screen.getByLabelText('Priorité')).toHaveValue('high');
    expect(screen.getByLabelText('Catégorie')).toHaveValue('Travail');
    expect(screen.getByLabelText('Statut')).toHaveValue('in-progress');
    expect(screen.getByLabelText('Date d\'échéance')).toHaveValue('2026-12-31');
  });

  it('appelle onClose quand on clique sur Annuler', async () => {
    const user = userEvent.setup();
    render(<TaskForm {...defaultProps} />);
    
    await user.click(screen.getByTestId('button-ghost'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('affiche une erreur si le titre est vide et empêche la soumission', async () => {
    const user = userEvent.setup();
    render(<TaskForm {...defaultProps} />);
    
    // Effacer le titre
    const titleInput = screen.getByLabelText('Titre');
    await user.clear(titleInput);
    
    // Essayer de soumettre
    await user.click(screen.getByTestId('button-primary'));
    
    expect(screen.getByTestId('error')).toHaveTextContent('Le titre est requis');
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('appelle onSubmit avec les bonnes données en mode création', async () => {
    const user = userEvent.setup();
    render(<TaskForm {...defaultProps} />);
    
    await user.type(screen.getByLabelText('Titre'), 'Nouvelle tâche');
    await user.type(screen.getByLabelText('Description'), 'Description test');
    await user.selectOptions(screen.getByLabelText('Priorité'), 'high');
    await user.selectOptions(screen.getByLabelText('Catégorie'), 'Travail');
    await user.type(screen.getByLabelText('Date d\'échéance'), '2026-12-31');
    
    await user.click(screen.getByTestId('button-primary'));
    
    expect(mockOnSubmit).toHaveBeenCalledWith({
      title: 'Nouvelle tâche',
      description: 'Description test',
      priority: 'high',
      category: 'Travail',
      dueDate: '2026-12-31',
    });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('appelle onSubmit avec les bonnes données en mode édition', async () => {
    const user = userEvent.setup();
    render(<TaskForm {...defaultProps} mode="edit" initialData={sampleTask} />);
    
    // Modifier quelques champs
    await user.clear(screen.getByLabelText('Titre'));
    await user.type(screen.getByLabelText('Titre'), 'Tâche modifiée');
    await user.selectOptions(screen.getByLabelText('Statut'), 'done');
    
    await user.click(screen.getByTestId('button-primary'));
    
    expect(mockOnSubmit).toHaveBeenCalledWith({
      title: 'Tâche modifiée',
      description: 'Test Description',
      priority: 'high',
      category: 'Travail',
      status: 'done',
      dueDate: '2026-12-31',
    });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('réinitialise le formulaire quand open devient true', () => {
    const { rerender } = render(<TaskForm {...defaultProps} open={false} />);
    
    // Simuler un changement d'état externe
    rerender(<TaskForm {...defaultProps} open={true} initialData={sampleTask} />);
    
    expect(screen.getByLabelText('Titre')).toHaveValue('Test Task');
  });
});