import pool from '../helpers/db.js';

export const createReply = async (req, res) => {
  try {
    const { review_id, user_id, content, parent_comment_id } = req.body;

    if (!review_id || !user_id || !content) {
      return res.status(400).json({
        error: 'review_id, user_id and content are required',
      });
    }

    const result = await pool.query(
      `
      INSERT INTO comments (review_id, user_id, content, parent_comment_id, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id, review_id, user_id, content, parent_comment_id, created_at
      `,
      [review_id, user_id, content, parent_comment_id || null]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating reply:', err.message);
    return res.status(500).json({ error: 'Failed to create reply' });
  }
};

export const getRepliesByReviewId = async (req, res) => {
  try {
    const { reviewId } = req.params;

    if (!reviewId) {
      return res.status(400).json({ error: 'reviewId is required' });
    }

    const result = await pool.query(
      `
      SELECT 
        c.id,
        c.review_id,
        c.user_id,
        c.content,
        c.parent_comment_id,
        c.created_at,
        u.username
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.review_id = $1
      ORDER BY c.created_at ASC
      `,
      [reviewId]
    );

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching replies:', err.message);
    return res.status(500).json({ error: 'Failed to fetch replies' });
  }
};
