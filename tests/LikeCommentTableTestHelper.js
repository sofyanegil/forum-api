/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const LikeCommentTableTestHelper = {
  async addlikeComment({
    id = 'like-123',
    commentId = 'comment-123',
    userId = 'user-123',
  }) {
    const query = {
      text: 'INSERT INTO user_comment_likes VALUES($1, $2, $3)',
      values: [id, commentId, userId],
    };

    await pool.query(query);
  },

  async findLikeCommentByCommentId(commentId) {
    const query = {
      text: 'SELECT * FROM user_comment_likes WHERE comment_id = $1',
      values: [commentId],
    };

    const result = await pool.query(query);

    return result.rows;
  },

  async removeLikeComment(commentId) {
    const query = {
      text: 'DELETE FROM user_comment_likes WHERE comment_id = $1',
      values: [commentId],
    };
    await pool.query(query);
  },

  async cleanTable() {
    await pool.query('DELETE FROM user_comment_likes WHERE 1=1');
  },
};

module.exports = LikeCommentTableTestHelper;
