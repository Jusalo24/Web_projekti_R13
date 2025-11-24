import React from "react";
import "../styles/notification.css";

export default function Notification({ message, type = "error", onClose }) {
  if (!message) return null;

  return (
    <div className={`notification notification--${type}`}>
      <span>{message}</span>
      <button onClick={onClose}>✕</button>
    </div>
  );
}