"use client";

import { type FC, useEffect } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";

interface ConfirmationPopupProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationPopup: FC<ConfirmationPopupProps> = ({
  message,
  onConfirm,
  onCancel,
}) => {
  // Log to check if component is rendering
  useEffect(() => {
    console.log("ConfirmationPopup rendered");
  }, []);

  // Fallback styles to ensure centering works even if CSS isn't loading properly
  const fallbackStyles = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 50,
      padding: "1rem",
    },
    popup: {
      backgroundColor: "#1a1a1a",
      border: "1px solid #27272a",
      borderRadius: "1rem",
      padding: "2rem",
      maxWidth: "400px",
      width: "100%",
      textAlign: "center" as const,
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    },
    content: {
      marginBottom: "2rem",
    },
    icon: {
      color: "#3b82f6",
      fontSize: "2rem",
      marginBottom: "1rem",
    },
    message: {
      color: "#fafafa",
      marginBottom: "2rem",
      lineHeight: 1.6,
    },
    actions: {
      display: "flex",
      gap: "1rem",
      justifyContent: "center",
    },
    confirmButton: {
      backgroundColor: "#10b981",
      color: "white",
      padding: "0.75rem 1.5rem",
      borderRadius: "0.5rem",
      border: "none",
      fontWeight: 600,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    cancelButton: {
      backgroundColor: "#ef4444",
      color: "white",
      padding: "0.75rem 1.5rem",
      borderRadius: "0.5rem",
      border: "none",
      fontWeight: 600,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
  };

  return (
    <div className="popup-overlay" style={fallbackStyles.overlay}>
      <div className="popup-confirmation" style={fallbackStyles.popup}>
        <div className="popup-content" style={fallbackStyles.content}>
          <h2 style={fallbackStyles.icon}>
            <i className="fa-solid fa-circle-question"></i>
          </h2>
          <p className="message" style={fallbackStyles.message}>
            {message}
          </p>
        </div>
        <div className="popup-actions" style={fallbackStyles.actions}>
          <button
            className="popup-confirm"
            style={fallbackStyles.confirmButton}
            onClick={onConfirm}
          >
            <i className="fa-solid fa-check"></i> Confirm
          </button>
          <button
            className="popup-cancel"
            style={fallbackStyles.cancelButton}
            onClick={onCancel}
          >
            <i className="fa-solid fa-times"></i> Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPopup;
