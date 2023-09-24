/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const RepliesTableTestHelper = {
  async addReply({
    id = 'reply-123',
    content = 'A Reply',
    commentId = 'comment-123',
    owner = 'user-123',
    date = new Date().toISOString(),
  }) {
    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5)',
      values: [id, content, date, owner, commentId],
    };

    await pool.query(query);
  },

  async findRepliesById(id) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1 AND is_delete = FALSE',
      values: [id],
    };

    const result = await pool.query(query);

    return result.rows;
  },

  async deleteReplyById(commentId) {
    const query = {
      text: 'UPDATE replies SET is_delete = TRUE WHERE id = $1',
      values: [commentId],
    };
    await pool.query(query);
  },

  async cleanTable() {
    await pool.query('DELETE FROM replies WHERE 1=1');
  },
};

module.exports = RepliesTableTestHelper;
