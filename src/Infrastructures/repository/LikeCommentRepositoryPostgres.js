const LikeCommentRepository = require('../../Domains/likeComments/LikeCommentRepository');

class LikeCommentRepositoryPostgres extends LikeCommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async verifyAvailableLike(commentId, userId) {
    const query = {
      text: 'SELECT * FROM user_comment_likes WHERE comment_id = $1 AND user_id = $2',
      values: [commentId, userId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      return false;
    }
    return true;
  }

  async likeComment(commentId, userId) {
    const id = `like-${this._idGenerator()}`;
    const query = {
      text: 'INSERT INTO user_comment_likes VALUES($1, $2, $3)',
      values: [id, commentId, userId],
    };

    await this._pool.query(query);
  }

  async unlikeComment(commentId, userId) {
    const query = {
      text: 'DELETE FROM user_comment_likes WHERE comment_id = $1 AND user_id = $2',
      values: [commentId, userId],
    };

    await this._pool.query(query);
  }

  async getLikesCountByCommentId(commentId) {
    const query = {
      text: 'SELECT * FROM user_comment_likes WHERE comment_id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);
    return result.rowCount;
  }
}

module.exports = LikeCommentRepositoryPostgres;
