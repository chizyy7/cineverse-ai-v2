'use client';

import * as React from 'react';
import { useState, useCallback, ReactNode } from 'react';
import toast from 'react-hot-toast';

interface ToastContextValue {
  toast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const toastFn = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    switch (type) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      case 'warning':
        // @ts-ignore: react-hot-toast warning method may not be properly typed
        toast.warning(message);
        break;
      default:
        toast(message);
    }
  }, []);

  const success = useCallback((message: string) => {
    toast.success(message);
  }, []);

  const error = useCallback((message: string) => {
    toast.error(message);
  }, []);

  const info = useCallback((message: string) => {
    toast(message);
  }, []);

  const warning = useCallback((message: string) => {
    // @ts-ignore: react-hot-toast warning method may not be properly typed
    toast.warning(message);
  }, []);

  return (
    <ToastContext.Provider value={{ toast: toastFn, success, error, info, warning }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}