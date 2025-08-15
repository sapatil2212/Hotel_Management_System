import { useState, useCallback } from 'react';

export interface DeleteConfirmationOptions {
  title?: string;
  description?: string;
  itemName?: string;
  variant?: 'danger' | 'warning';
}

export interface DeleteConfirmationState {
  isOpen: boolean;
  title: string;
  description: string;
  itemName?: string;
  variant: 'danger' | 'warning';
  onConfirm: (() => void) | null;
}

export function useDeleteConfirmation() {
  const [state, setState] = useState<DeleteConfirmationState>({
    isOpen: false,
    title: 'Confirm Deletion',
    description: 'Are you sure you want to delete this item? This action cannot be undone.',
    itemName: undefined,
    variant: 'danger',
    onConfirm: null,
  });

  const [isLoading, setIsLoading] = useState(false);

  const showDeleteConfirmation = useCallback((
    onConfirm: () => void | Promise<void>,
    options: DeleteConfirmationOptions = {}
  ) => {
    setState({
      isOpen: true,
      title: options.title || 'Confirm Deletion',
      description: options.description || 'Are you sure you want to delete this item? This action cannot be undone.',
      itemName: options.itemName,
      variant: options.variant || 'danger',
      onConfirm: async () => {
        try {
          setIsLoading(true);
          await onConfirm();
        } finally {
          setIsLoading(false);
          setState(prev => ({ ...prev, isOpen: false }));
        }
      },
    });
  }, []);

  const hideDeleteConfirmation = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }));
    setIsLoading(false);
  }, []);

  return {
    isOpen: state.isOpen,
    title: state.title,
    description: state.description,
    itemName: state.itemName,
    variant: state.variant,
    isLoading,
    onConfirm: state.onConfirm || (() => {}),
    onClose: hideDeleteConfirmation,
    showDeleteConfirmation,
  };
}
