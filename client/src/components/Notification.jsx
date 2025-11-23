import React, { useEffect } from "react";
import "../styles/notification.css";

export default function Notification({ message, type, onClose }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className={`notification notification--${type}`}>
      <div className="notification__content">
        <span className="notification__icon">
          {type === "error" ? "⚠️" : type === "success" ? "✓" : "ℹ️"}
        </span>
        <p className="notification__message">{message}</p>
      </div>
      <button
        className="notification__close"
        onClick={onClose}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}