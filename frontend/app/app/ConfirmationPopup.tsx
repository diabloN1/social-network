import { FC } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./popup.css";

interface ConfirmationPopupProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationPopup: FC<ConfirmationPopupProps> = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-box popup-confirmation">
        <div className="popup-content">
          <h2>
            <i className="fa-solid fa-circle-question"></i>
          </h2>
          <p>{message}</p>
          <div className="popup-actions">
            <button className="popup-confirm" onClick={onConfirm}>
              <i className="fa-solid fa-check"></i> Confirm
            </button>
            <button className="popup-cancel" onClick={onCancel}>
              <i className="fa-solid fa-times"></i> Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPopup;
