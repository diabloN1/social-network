  // FC stands for Function Component
  import { FC, useEffect } from "react";
  import '@fortawesome/fontawesome-free/css/all.min.css';
  import "./popup.css";

  interface PopupProps {
    message: string;
    status: "success" | "failure";
    onClose: () => void;
  }

  const Popup: FC<PopupProps> = ({ message, status, onClose }) => {
    const isSuccess = status === "success";

    useEffect(() => {
      const timer = setTimeout(onClose, 3000); 
      return () => clearTimeout(timer);
    }, [onClose]);


    return (
      <div className="popup-overlay">
        <div className={`popup-box ${isSuccess ? "popup-success" : "popup-failure"}`}>
          <div className="popup-content">
          <h2>{isSuccess ? <i className="fa-solid fa-circle-check"></i> : <i className="fa-solid fa-circle-exclamation"></i>}</h2>
          
          <p>{message}</p>
          <button className="popup-close" onClick={onClose} aria-label="Close">
              <i className="fa-solid fa-circle-xmark"></i>
          </button>
          </div>
          
          <div className="popup-timer"></div>

        </div>
      </div>
    );
  };

  export default Popup;
