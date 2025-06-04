"use client";

import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";

// Error interface
interface Error {
  message: string;
  code?: number;
}

// Context type
interface ErrorContextType {
  error: Error | null;
  showError: (message: string, code?: number) => void;
  clearError: () => void;
}

// Create the context
const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

// Global error handler reference
let globalShowError: ((message: string, code?: number) => void) ;

export const setGlobalErrorHandler = (
  fn: (message: string, code?: number) => void
) => {
  globalShowError = fn;
};

export const getGlobalErrorHandler = () => globalShowError;

// Provider component
export const ErrorProvider = ({ children }: { children: ReactNode }) => {
  const [error, setError] = useState<Error | null>(null);

  const showError = (message: string, code?: number) => {
    setError({ message, code });
  };

  const clearError = () => {
    setError(null);
  };

  useEffect(() => {
    // Register the global error handler
    setGlobalErrorHandler(showError);
    return () => {
      setGlobalErrorHandler(() => {}); // Clear on unmount
    };
  }, []);

  return (
    <ErrorContext.Provider value={{ error, showError, clearError }}>
      {children}
    </ErrorContext.Provider>
  );
};

// Hook for using context in components
export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error("useError must be used within an ErrorProvider");
  }
  return context;
};
