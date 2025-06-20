export interface Toast {
  (message: string, type: 'success' | 'error'): void;
}

export interface ToastHook {
  addToast: Toast;
}

export function useToast(): ToastHook {
  return {
    addToast: (message: string, type: 'success' | 'error') => {
      // Implementation will be handled by the actual toast component
      console.log(`${type}: ${message}`);
    }
  };
}
