import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/ForumDetails.css";
import { BASE_URL } from "../services/api";

function ForumDetail() {
  const { forumTitle } = useParams(); // Get the forum title from the URL
  const [forumPost, setForumPost] = useState(null);
  const [comments, setComments] = useState([]); // State for comments with nested replies
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState(""); // State for new comment
  const [newReply, setNewReply] = useState(""); // State for new reply
  const [replyTarget, setReplyTarget] = useState(null); // ID of the comment being replied to
  const [error, setError] = useState(""); // State for error messages
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setError("You need to be signed in to interact with this forum.");
    }

    const fetchForumPost = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/api/forum-posts/title/${encodeURIComponent(forumTitle)}`
        );
        if (!response.ok) throw new Error("Failed to fetch forum post");
        const data = await response.json();
        setForumPost(data.post);

        // Nest replies under their parent comments
        const nestedComments = data.comments.reduce((acc, comment) => {
          if (!comment.parent_comment_id) {
            // Top-level comment
            acc.push({ ...comment, replies: [] });
          } else {
            // Reply: Find the parent comment and add the reply
            const parentComment = acc.find(
              (parent) => parent.comment_id === comment.parent_comment_id
            );
            if (parentComment) {
              parentComment.replies = parentComment.replies || [];
              parentComment.replies.push(comment);
            }
          }
          return acc;
        }, []);
        setComments(nestedComments);
      } catch (error) {
        console.error("Error fetching forum post:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchForumPost();
  }, [forumTitle, token]);

  const handleCommentSubmit = async () => {
    if (!token) {
      setError("You need to be signed in to post a comment.");
      return;
    }
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`${BASE_URL}/api/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ post_id: forumPost.post_id, content: newComment }),
      });

      if (!response.ok) {
        throw new Error("Failed to post comment.");
      }

      const comment = await response.json();
      setComments((prev) => [...prev, { ...comment, replies: [] }]);
      setNewComment("");
      setError(""); // Clear error after successful submission
    } catch (error) {
      console.error("Error posting comment:", error.message);
    }
  };

  const handleReplySubmit = async () => {
    if (!token) {
      setError("You need to be signed in to post a reply.");
      return;
    }
    if (!newReply.trim() || !replyTarget) return;

    try {
      const response = await fetch(`${BASE_URL}/api/comments/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          post_id: forumPost.post_id,
          content: newReply,
          parent_comment_id: replyTarget,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to post reply.");
      }

      const reply = await response.json();

      setComments((prev) =>
        prev.map((comment) =>
          comment.comment_id === replyTarget
            ? { ...comment, replies: [...(comment.replies || []), reply] }
            : comment
        )
      );

      setNewReply("");
      setReplyTarget(null);
      setError(""); // Clear error after successful submission
    } catch (error) {
      console.error("Error posting reply:", error.message);
    }
  };

  if (loading) return <p>Loading forum post...</p>;

  if (!forumPost) return <p>Forum post not found</p>;

  return (
    <div className="forum-detail-container">
      <h1>{forumPost.title}</h1>
      <p>{forumPost.body}</p>

      {/* Display genres */}
      {forumPost.tags && forumPost.tags.length > 0 ? (
        <div className="genres-container">
          <h3>Genres:</h3>
          <ul className="genres-list">
            {forumPost.tags.map((genre, index) => (
              <li key={index} className="genre-item">
                {genre}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>No genres available.</p>
      )}

      <h2>Comments</h2>
      {error && <p className="error-message" style={{ color: "red" }}>{error}</p>}
      <ul>
        {comments.length > 0 ? (
          comments.map((comment) => (
            <li key={comment.comment_id}>
              <p>{comment.content}</p>
              <small>By: {comment.username || "Anonymous"}</small>
              <small> at {new Date(comment.created_at).toLocaleString()}</small>
              <button onClick={() => setReplyTarget(comment.comment_id)}>
                Reply
              </button>

              {/* Render reply textarea if this is the comment being replied to */}
              {replyTarget === comment.comment_id && (
                <div className="reply-form-container">
                  <textarea
                    placeholder="Write a reply..."
                    value={newReply}
                    onChange={(e) => {
                      setNewReply(e.target.value);
                      if (error) setError(""); // Clear error when the user types
                    }}
                  />
                  <button onClick={handleReplySubmit}>Post Reply</button>
                  <button
                    onClick={() => {
                      setReplyTarget(null);
                      setError(""); // Clear error when canceling
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Nested replies */}
              {comment.replies && comment.replies.length > 0 && (
                <ul className="replies-list">
                  {comment.replies.map((reply) => (
                    <li key={reply.comment_id} className="reply-item">
                      <p>{reply.content}</p>
                      <small>By: {reply.username || "Anonymous"}</small>
                      <small> at {new Date(reply.created_at).toLocaleString()}</small>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))
        ) : (
          <p>No comments yet.</p>
        )}
      </ul>

      <div className="add-comment">
        <textarea
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => {
            setNewComment(e.target.value);
            if (error) setError(""); // Clear error when the user types
          }}
        />
        <button onClick={handleCommentSubmit}>Post Comment</button>
      </div>
    </div>
  );
}

export default ForumDetail;
