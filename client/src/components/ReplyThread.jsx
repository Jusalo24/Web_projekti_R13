import React, { useEffect, useState } from "react";
import { useApi } from "../hooks/useApi";
import ReplyForm from "./ReplyForm";

export default function ReplyThread({ reviewId }) {
  const { request } = useApi();
  const [replies, setReplies] = useState([]);

  useEffect(() => {
    if (reviewId) {
      fetchReplies();
    }
  }, [reviewId]);

  async function fetchReplies() {
    try {
      const data = await request(`/api/reviews/${reviewId}/replies`);
      setReplies(data || []);
    } catch (err) {
      console.error("Failed to load replies:", err);
    }
  }

  function buildTree(list) {
    const map = {};
    list.forEach((c) => (map[c.id] = { ...c, children: [] }));
    const roots = [];

    list.forEach((c) => {
      if (c.parent_comment_id) {
        map[c.parent_comment_id]?.children.push(map[c.id]);
      } else {
        roots.push(map[c.id]);
      }
    });

    return roots;
  }

  const tree = buildTree(replies);

  return (
    <div className="reply-thread">
      {tree.map((node) => (
        <CommentNode key={node.id} node={node} onChange={fetchReplies} />
      ))}

      {/* Juuri-tason kommenttilaatikko */}
      <ReplyForm reviewId={reviewId} parentId={null} onPosted={fetchReplies} />
    </div>
  );
}

function CommentNode({ node, onChange }) {
  const [showReply, setShowReply] = useState(false);
  const isChild = Boolean(node.parent_comment_id);

  return (
    <div className="reply-row">
      <div className={`reply-card ${isChild ? "reply-card--child" : ""}`}>
        <div className="reply-avatar">
          {(node.username || node.user_id || "?")[0]?.toUpperCase()}
        </div>

        <div className="reply-body">
          <div className="reply-meta">
            <strong className="reply-author">
              {node.username || node.user_id}
            </strong>
            <span className="reply-dot">•</span>
            <span className="reply-time">
              {new Date(node.created_at).toLocaleString()}
            </span>
          </div>

          <div className="reply-content">{node.content}</div>

          <div className="reply-actions">
            <button type="button" onClick={() => setShowReply((s) => !s)}>
              {showReply ? "Cancel" : "Reply"}
            </button>
          </div>

          {showReply && (
            <ReplyForm
              reviewId={node.review_id}
              parentId={node.id}
              onPosted={() => {
                setShowReply(false);
                onChange();
              }}
            />
          )}

          {node.children?.map((child) => (
            <CommentNode key={child.id} node={child} onChange={onChange} />
          ))}
        </div>
      </div>
    </div>
  );
}
