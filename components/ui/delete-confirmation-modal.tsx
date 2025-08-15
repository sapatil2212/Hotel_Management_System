'use client';

import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Button } from './button';

export interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  itemName?: string;
  isLoading?: boolean;
  variant?: 'danger' | 'warning';
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Deletion',
  description = 'Are you sure you want to delete this item? This action cannot be undone.',
  itemName,
  isLoading = false,
  variant = 'danger',
}: DeleteConfirmationModalProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  const getIconColor = () => {
    return variant === 'danger' ? 'text-red-600' : 'text-orange-600';
  };

  const getButtonVariant = () => {
    return variant === 'danger' ? 'destructive' : 'default';
  };

  const getBackgroundColor = () => {
    return variant === 'danger' ? 'bg-red-50' : 'bg-orange-50';
  };

  const getBorderColor = () => {
    return variant === 'danger' ? 'border-red-200' : 'border-orange-200';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className={`h-8 w-8 ${getIconColor()}`} />
          </div>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {title}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {description}
            {itemName && (
              <span className="block mt-2 font-medium text-gray-900">
                "{itemName}"
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className={`mt-4 rounded-lg p-4 ${getBackgroundColor()} ${getBorderColor()} border`}>
          <div className="flex items-start space-x-3">
            <Trash2 className={`h-5 w-5 mt-0.5 ${getIconColor()}`} />
            <div className="text-sm text-gray-700">
              <p className="font-medium">This action will permanently delete the selected item.</p>
              <p className="mt-1 text-gray-600">
                All associated data will be removed and cannot be recovered.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={getButtonVariant()}
            onClick={handleConfirm}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span>Deleting...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
