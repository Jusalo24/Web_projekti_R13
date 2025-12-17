import React, { useState } from "react";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";

const REPLY_CHAR_LIMIT = 280;

export default function ReplyForm({ reviewId, parentId = null, onPosted }) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const { request } = useApi();
  const { user, token } = useAuth();

  if (!token || !user || !reviewId) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    const trimmed = content.trim();
    if (!trimmed) return;

    const payload = {
      review_id: reviewId,
      content: trimmed,
      parent_comment_id: parentId,
    };


    try {
      setSubmitting(true);
      setError(null);

      await request("/api/replies", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setContent("");
      onPosted && onPosted();
    } catch (err) {
      console.error("Failed to post reply:", err);
      setError(err.message || "Failed to post reply");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="reply-form">
      <textarea
        value={content}
        maxLength={REPLY_CHAR_LIMIT}
        onChange={(e) => setContent(e.target.value.slice(0, REPLY_CHAR_LIMIT))}
        placeholder={parentId ? "Reply..." : "Add a comment..."}
        rows={parentId ? 2 : 3}
      />
      <small className="reply-form__counter">
        {content.length}/{REPLY_CHAR_LIMIT}
      </small>
      <div className="reply-form__actions">
        <button type="submit" disabled={submitting || !content.trim()}>
          {submitting ? "Sending..." : "Reply"}
        </button>
        {error && <span className="reply-form__error">{error}</span>}
      </div>
    </form>
  );
}
