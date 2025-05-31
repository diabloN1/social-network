"use client";

import { createContext, useState, useContext, ReactNode } from "react";

interface Error {
  message: string;
  code?: number;
}

interface ErrorContextType {
  error: Error | null;
  showError: (message: string, code?: number) => void;
  clearError: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider = ({ children }: { children: ReactNode }) => {
  const [error, setError] = useState<Error | null>(null);

  const showError = (message: string, code?: number) => {
    setError({ message, code });
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <ErrorContext.Provider value={{ error, showError, clearError }}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error("useError must be used within an ErrorProvider");
  }
  return context;
};
