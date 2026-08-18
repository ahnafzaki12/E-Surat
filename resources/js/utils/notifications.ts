import Swal from 'sweetalert2';
import React from 'react';
import { createRoot } from 'react-dom/client';
import ConfirmModal from '../components/ui/modal/ConfirmModal';

/**
 * Toast notification for quick feedback
 */
export const showToast = (icon: 'success' | 'error' | 'warning' | 'info', title: string) => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    customClass: {
      popup: 'dark:bg-gray-900 dark:text-white rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800',
    },
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });

  Toast.fire({
    icon,
    title
  });
};

/**
 * Confirmation dialog for destructive actions
 */
export const showConfirm = async (
  title: string = 'Are you sure?', 
  text: string = "You won't be able to revert this!",
  confirmButtonText: string = 'Yes, delete it!'
) => {
  return new Promise<{ isConfirmed: boolean }>((resolve) => {
    // Create a container for the modal
    const container = document.createElement('div');
    document.body.appendChild(container);
    
    // Create a React root
    const root = createRoot(container);

    const handleClose = () => {
      resolve({ isConfirmed: false });
      root.unmount();
      container.remove();
    };

    const handleConfirm = () => {
      resolve({ isConfirmed: true });
      root.unmount();
      container.remove();
    };

    // Determine if it's destructive based on keywords
    const isDestructive = 
      title.toLowerCase().includes('delete') || 
      title.toLowerCase().includes('hapus') || 
      title.toLowerCase().includes('remove');

    // Render the modal
    root.render(
      React.createElement(ConfirmModal, {
        isOpen: true,
        onClose: handleClose,
        onConfirm: handleConfirm,
        title: title,
        message: text,
        confirmText: confirmButtonText,
        isDestructive: isDestructive
      })
    );
  });
};

/**
 * Success/Error/Info Alert Dialog
 */
export const showAlert = (
    icon: 'success' | 'error' | 'warning' | 'info',
    title: string,
    text: string
) => {
    return Swal.fire({
        icon,
        title,
        text,
        confirmButtonColor: '#465fff',
        customClass: {
            popup: 'rounded-3xl dark:bg-gray-900 dark:text-white border border-gray-100 dark:border-gray-800',
            title: 'text-xl font-bold text-gray-800 dark:text-white/90',
            htmlContainer: 'text-sm text-gray-500 dark:text-gray-400',
            confirmButton: 'px-8 py-2.5 rounded-xl font-medium'
        }
    });
};
