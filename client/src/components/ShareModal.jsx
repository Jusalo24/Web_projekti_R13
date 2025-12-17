import React, { useState, useEffect } from "react";
import { Copy, Trash2, XCircle, CheckCircle, Share2, Clock } from "lucide-react";
import { useShareApi } from "../hooks/useShareApi";
import "../styles/share.css";

export default function ShareModal({ list, onClose, token }) {
  const [shares, setShares] = useState([]);
  const [expirationDays, setExpirationDays] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const {
    loading,
    getShareLinks,
    createShareLink,
    revokeShareLink,
    deleteShareLink,
    copyToClipboard
  } = useShareApi(token);

  useEffect(() => {
    loadShares();
  }, [list.id]);

  const loadShares = async () => {
    const data = await getShareLinks(list.id);
    setShares(data || []);
  };

  const handleCreateShare = async () => {
    const days = expirationDays ? parseInt(expirationDays, 10) : null;
    
    if (days !== null && (isNaN(days) || days < 1 || days > 365)) {
      alert("Expiration days must be between 1 and 365");
      return;
    }

    const result = await createShareLink(list.id, days);
    
    if (result) {
      setExpirationDays("");
      setShowCreateForm(false);
      await loadShares();
    }
  };

  const handleCopy = async (shareUrl, shareId) => {
    const success = await copyToClipboard(shareUrl);
    if (success) {
      setCopiedId(shareId);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleRevoke = async (shareId) => {
    if (confirm("Are you sure you want to revoke this share link?")) {
      const success = await revokeShareLink(shareId);
      if (success) {
        await loadShares();
      }
    }
  };

  const handleDelete = async (shareId) => {
    if (confirm("Are you sure you want to permanently delete this share link?")) {
      const success = await deleteShareLink(shareId);
      if (success) {
        await loadShares();
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const getShareStatus = (share) => {
    if (!share.isActive) return "revoked";
    if (share.isExpired) return "expired";
    return "active";
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box share-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header">
          <div className="share-modal__header-content">
            <Share2 size={24} />
            <h3>Share "{list.title}"</h3>
          </div>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="modal-body share-modal__body">
          
          {/* Create New Share Button */}
          {!showCreateForm && (
            <button 
              className="share-modal__create-btn"
              onClick={() => setShowCreateForm(true)}
            >
              + Create New Share Link
            </button>
          )}

          {/* Create Share Form */}
          {showCreateForm && (
            <div className="share-create-form">
              <label>
                Expiration Days (Optional)
                <input
                  type="number"
                  min="1"
                  max="365"
                  placeholder="Leave empty for no expiration"
                  value={expirationDays}
                  onChange={(e) => setExpirationDays(e.target.value)}
                />
              </label>
              
              <div className="share-create-form__actions">
                <button 
                  className="share-create-form__submit"
                  onClick={handleCreateShare}
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Link"}
                </button>
                <button 
                  className="share-create-form__cancel"
                  onClick={() => {
                    setShowCreateForm(false);
                    setExpirationDays("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && shares.length === 0 && (
            <div className="share-modal__loading">
              <div className="spinner"></div>
              <p>Loading shares...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && shares.length === 0 && (
            <div className="share-modal__empty">
              <Share2 size={48} opacity={0.3} />
              <p>No share links yet</p>
              <p className="share-modal__empty-hint">
                Create a share link to let others view this list
              </p>
            </div>
          )}

          {/* Shares List */}
          {shares.length > 0 && (
            <div className="share-links-list">
              <h4>Active Share Links</h4>
              
              {shares.map((share) => {
                const status = getShareStatus(share);
                const isCopied = copiedId === share.id;

                return (
                  <div key={share.id} className={`share-link-card share-link-card--${status}`}>
                    
                    {/* Status Badge */}
                    <div className="share-link-card__header">
                      <div className={`share-status-badge share-status-badge--${status}`}>
                        {status === "active" && <CheckCircle size={14} />}
                        {status === "expired" && <Clock size={14} />}
                        {status === "revoked" && <XCircle size={14} />}
                        <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                      </div>
                    </div>

                    {/* Share URL */}
                    <div className="share-link-card__url">
                      <input
                        type="text"
                        value={share.shareUrl}
                        readOnly
                        onClick={(e) => e.target.select()}
                      />
                      <button
                        className={`share-copy-btn ${isCopied ? "share-copy-btn--copied" : ""}`}
                        onClick={() => handleCopy(share.shareUrl, share.id)}
                        disabled={status !== "active"}
                      >
                        {isCopied ? (
                          <>
                            <CheckCircle size={18} />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={18} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Meta Info */}
                    <div className="share-link-card__meta">
                      <span>Created: {formatDate(share.createdAt)}</span>
                      <span>Expires: {formatDate(share.expiresAt)}</span>
                    </div>

                    {/* Actions */}
                    {status === "active" && (
                      <div className="share-link-card__actions">
                        <button
                          className="share-action-btn share-action-btn--revoke"
                          onClick={() => handleRevoke(share.id)}
                        >
                          <XCircle size={16} />
                          Revoke
                        </button>
                        <button
                          className="share-action-btn share-action-btn--delete"
                          onClick={() => handleDelete(share.id)}
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    )}

                    {status !== "active" && (
                      <div className="share-link-card__actions">
                        <button
                          className="share-action-btn share-action-btn--delete"
                          onClick={() => handleDelete(share.id)}
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="modal-btn cancel" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
