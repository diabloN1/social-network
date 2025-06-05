// Define the error structure
export interface AppError {
  message: string;
  code?: number;
}

// Global error handler function reference
let globalErrorHandler: (error: AppError) => void = () => {};

// Setter for global error handler
export const setGlobalErrorHandler = (fn: (error: AppError) => void) => {
  globalErrorHandler = fn;
};

// Getter for global error handler
export const getGlobalErrorHandler = () => globalErrorHandler;

// Convenience function to trigger global error
export const showGlobalError = (message: string, code?: number) => {
  globalErrorHandler({ message, code });
};
