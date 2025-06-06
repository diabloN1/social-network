"use client";

import { AppError, setGlobalErrorHandler } from "@/helpers/ErrorProvider";
import { useEffect, useState } from "react";

export default function ErrorPopup() {
  const [error, setError] = useState<AppError | null>(null);

  const clearError = () => setError(null);

  useEffect(() => {
    setGlobalErrorHandler((err: AppError) => {
      setError(err);
    });

    return () => {
      setGlobalErrorHandler(() => {}); // Cleanup
    };
  }, []);

  if (!error) return null;

  return (
    <div className="modal-overlay" onClick={clearError}>
      <div
        className="post-share-modal"
        style={{ cursor: "default", pointerEvents: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Error {error.code || "❗"}</h2>
          <button className="close-btn" onClick={clearError}>
            ×
          </button>
        </div>
        <div className="modal-content">
          <p
            style={{
              color: "var(--text-secondary, #b0b3b8)",
              fontSize: 15,
              textAlign: "center",
              paddingTop: 12,
            }}
          >
            {error.message}
          </p>
        </div>
      </div>
    </div>
  );
}
