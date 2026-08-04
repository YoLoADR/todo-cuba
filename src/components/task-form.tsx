"use client";

import { useEffect, useState, useCallback } from 'react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PRIORITIES, STATUSES, SUGGESTED_CATEGORIES, type Task } from '@/lib/db/schema';

type TaskFormProps = {
  open: boolean;
  onClose: () => void;
  initialData?: Partial<Task>;
  onSubmit: (data: {
    title: string;
    description?: string;
    priority?: string;
    category?: string;
    status?: string;
    dueDate?: string;
  }) => void;
  mode: 'create' | 'edit';
};

export default function TaskForm({ open, onClose, initialData, onSubmit, mode }: TaskFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    priority: initialData?.priority || 'medium',
    category: initialData?.category || '',
    status: initialData?.status || 'todo',
    dueDate: initialData?.dueDate || '',
  });
  
  const [errors, setErrors] = useState({
    title: '',
  });

  // Fonction pour réinitialiser le formulaire
  const resetForm = useCallback(() => {
    setFormData({
      title: initialData?.title || '',
      description: initialData?.description || '',
      priority: initialData?.priority || 'medium',
      category: initialData?.category || '',
      status: initialData?.status || 'todo',
      dueDate: initialData?.dueDate || '',
    });
    setErrors({ title: '' });
  }, [initialData]);

  // Réinitialiser le formulaire quand open change
  /* eslint-disable react-hooks/set-state-in-effect -- reset du formulaire à l'ouverture de la modale */
  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, resetForm]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNativeSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    let valid = true;
    const newErrors = { title: '' };
    
    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
      valid = false;
    }
    
    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    const submitData: {
      title: string;
      description?: string;
      priority?: string;
      category?: string;
      status?: string;
      dueDate?: string;
    } = {
      title: formData.title.trim(),
      category: formData.category || undefined,
    };
    
    if (formData.description) submitData.description = formData.description;
    if (formData.priority) submitData.priority = formData.priority;
    if (formData.dueDate) submitData.dueDate = formData.dueDate;
    if (mode === 'edit' && formData.status) submitData.status = formData.status;
    
    onSubmit(submitData);
    onClose();
  };

  const priorityOptions = PRIORITIES.map(p => ({
    value: p,
    label: p === 'low' ? 'Faible' : 
           p === 'medium' ? 'Moyenne' : 
           p === 'high' ? 'Haute' : 
           'Urgente'
  }));

  const statusOptions = STATUSES.map(s => ({
    value: s,
    label: s === 'backlog' ? 'Backlog' : 
           s === 'todo' ? 'À faire' : 
           s === 'in-progress' ? 'En cours' : 
           'Terminé'
  }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === 'create' ? 'Nouvelle tâche' : 'Modifier la tâche'}
      footer={(
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {mode === 'create' ? 'Créer' : 'Modifier'}
          </Button>
        </div>
      )}
    >
      <form className="space-y-4">
        <Input
          id="task-title"
          label="Titre"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          error={errors.title}
          required
        />
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleTextareaChange}
            className="w-full p-2 border rounded-md min-h-[100px]"
            maxLength={2000}
          />
        </div>
        
        <Select
          id="task-priority"
          label="Priorité"
          name="priority"
          options={priorityOptions}
          value={formData.priority}
          onChange={handleSelectChange}
        />
        
        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-1">Catégorie</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleNativeSelectChange}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Sélectionner une catégorie</option>
            {SUGGESTED_CATEGORIES.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
            <option value="Autre">Autre</option>
          </select>
        </div>
        
        <Input
          id="task-due-date"
          label="Date d'échéance"
          name="dueDate"
          type="date"
          value={formData.dueDate}
          onChange={handleInputChange}
        />
        
        {mode === 'edit' && (
          <Select
            id="task-status"
            label="Statut"
            name="status"
            options={statusOptions}
            value={formData.status}
            onChange={handleSelectChange}
          />
        )}
      </form>
    </Modal>
  );
}