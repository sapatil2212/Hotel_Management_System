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
      <DialogContent className="max-w-[95vw] sm:max-w-md w-full max-h-[90vh] overflow-y-auto p-3 sm:p-6 rounded-lg flex flex-col mx-auto">
        <DialogHeader className="text-center mb-3 sm:mb-6">
          <div className="mx-auto mb-3 sm:mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className={`h-6 w-6 sm:h-8 sm:w-8 ${getIconColor()}`} />
          </div>
          <DialogTitle className="text-base sm:text-xl font-semibold text-gray-900">
            {title}
          </DialogTitle>
          <DialogDescription className="text-[10px] sm:text-sm text-gray-600">
            {description}
            {itemName && (
              <span className="block mt-2 font-medium text-gray-900 text-xs sm:text-sm">
                "{itemName}"
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className={`mt-3 sm:mt-4 rounded-lg p-3 sm:p-4 ${getBackgroundColor()} ${getBorderColor()} border`}>
          <div className="flex items-start space-x-2 sm:space-x-3">
            <Trash2 className={`h-4 w-4 sm:h-5 sm:w-5 mt-0.5 ${getIconColor()}`} />
            <div className="text-xs sm:text-sm text-gray-700">
              <p className="font-medium">This action will permanently delete the selected item.</p>
              <p className="mt-1 text-gray-600">
                All associated data will be removed and cannot be recovered.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4 sm:mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto h-8 sm:h-9 text-xs sm:text-sm"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={getButtonVariant()}
            onClick={handleConfirm}
            disabled={isLoading}
            className="w-full sm:w-auto h-8 sm:h-9 text-xs sm:text-sm"
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
