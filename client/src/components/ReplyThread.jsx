import React, { useEffect, useMemo, useState } from "react";
import { useApi } from "../hooks/useApi";
import ReplyForm from "./ReplyForm";

const MAX_NESTING = 3;

export default function ReplyThread({ reviewId }) {
  const { request } = useApi();
  const [rawReplies, setRawReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  useEffect(() => {
    if (reviewId) {
      fetchReplies();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviewId]);

  async function fetchReplies() {
    if (!reviewId) return;

    setLoadingReplies(true);
    try {
      const data = await request(`/api/reviews/${reviewId}/replies`);
      setRawReplies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load replies:", err);
      setRawReplies([]);
    } finally {
      setLoadingReplies(false);
    }
  }

  const handleReplyPosted = () => {
    fetchReplies();
    setShowReplies(true);
  };

  const tree = useMemo(() => buildTree(rawReplies), [rawReplies]);
  const totalReplies = rawReplies.length;

  return (
    <div className="reply-thread">
      <button
        type="button"
        className="reply-thread__toggle"
        onClick={() => setShowReplies((prev) => !prev)}
      >
        {showReplies ? "Hide replies" : "Show replies"} ({totalReplies})
      </button>

      {showReplies && (
        <div className="reply-thread__content">
          {loadingReplies ? (
            <p className="reply-thread__loading">Loading replies…</p>
          ) : (
            tree.map((node) => (
              <CommentNode
                key={node.id}
                node={node}
                depth={node.depth ?? 1}
                onReplyPosted={handleReplyPosted}
              />
            ))
          )}

          <ReplyForm
            reviewId={reviewId}
            parentId={null}
            onPosted={handleReplyPosted}
          />
        </div>
      )}
    </div>
  );
}

function buildTree(list) {
  if (!Array.isArray(list) || list.length === 0) {
    return [];
  }

  const lookup = new Map();
  list.forEach((item) => lookup.set(item.id, { ...item, children: [] }));

  const roots = [];
  list.forEach((item) => {
    const node = lookup.get(item.id);
    if (item.parent_comment_id && lookup.has(item.parent_comment_id)) {
      lookup.get(item.parent_comment_id).children.push(node);
    } else {
      roots.push(node);
    }
  });

  const flatten = (node, parent) => {
    const base = {
      ...node,
      depth: MAX_NESTING,
      replyingTo: parent ? parent.username || parent.user_id || null : null,
      children: [],
    };
    const collected = [base];
    node.children?.forEach((child) => {
      flatten(child, node).forEach((desc) => collected.push(desc));
    });
    return collected;
  };

  const applyLimit = (node, depth = 1) => {
    node.depth = depth;

    if (!node.children?.length) {
      return node;
    }

    if (depth >= MAX_NESTING) {
      node.children = node.children.flatMap((child) =>
        flatten(child, node)
      );
      return node;
    }

    node.children = node.children.map((child) =>
      applyLimit(child, depth + 1)
    );
    return node;
  };

  return roots.map((root) => applyLimit(root, 1));
}

function CommentNode({ node, depth, onReplyPosted }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const isChild = depth > 1;
  const canReply = depth <= MAX_NESTING;
  const nextDepth = Math.min(depth + 1, MAX_NESTING);

  return (
    <div className="reply-row">
      <div className={`reply-card ${isChild ? "reply-card--child" : ""}`}>
        <div className="reply-avatar">
          {(node.username || node.user_id || "?")[0]?.toUpperCase()}
        </div>

        <div className="reply-body">
          {node.replyingTo && (
            <span className="replying-to">
              Replying to {node.replyingTo}
            </span>
          )}

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

          {canReply && (
            <div className="reply-actions">
              <button
                type="button"
                onClick={() => setShowReplyForm((prev) => !prev)}
              >
                {showReplyForm ? "Cancel" : "Reply"}
              </button>
            </div>
          )}

          {canReply && showReplyForm && (
            <ReplyForm
              reviewId={node.review_id}
              parentId={node.id}
              onPosted={() => {
                setShowReplyForm(false);
                onReplyPosted();
              }}
            />
          )}

          {node.children?.map((child) => (
            <CommentNode
              key={child.id}
              node={child}
              depth={child.depth ?? nextDepth}
              onReplyPosted={onReplyPosted}
            />
          ))}
        </div>
      </div>
    </div>
  );
}