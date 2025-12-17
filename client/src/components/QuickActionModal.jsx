import React, { useState } from "react";
import "../styles/quickActionModal.css";

/**
 * Quick Action Modal - Shows options to add movie to Group or Favorite List
 * Then opens the appropriate specialized modal
 */
export default function QuickActionModal({
  onClose,
  onSelectGroup,
  onSelectFavorite
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box quick-action-modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 id="quick-action-title">Add to...</h3>
          <button type="button" className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <button
            type="button"
            className="quick-action-btn quick-action-btn--group"
            onClick={onSelectGroup}
            aria-labelledby="quick-action-title"
          >
            <span className="quick-action-icon">👥</span>
            <div className="quick-action-text">
              <strong>Add to Group</strong>
              <small>Share with group members</small>
            </div>
          </button>

          <button
            type="button"
            className="quick-action-btn quick-action-btn--favorite"
            onClick={onSelectFavorite}
            aria-labelledby="quick-action-title"
          >
            <span className="quick-action-icon">❤️</span>
            <div className="quick-action-text">
              <strong>Add to Favorite List</strong>
              <small>Save to your personal lists</small>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
