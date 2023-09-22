const CommentRepository = require('../../Domains/comments/CommentRepository');
const AddedComment = require('../../Domains/comments/entities/AddedComment');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(owner, threadId, newComment) {
    const { content } = newComment;
    const id = `comment-${this._idGenerator()}`;
    const createdAt = new Date().toISOString();
    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [id, owner, threadId, content, createdAt],
    };
    const result = await this._pool.query(query);
    return new AddedComment({
      ...result.rows[0],
    });
  }
}

module.exports = CommentRepositoryPostgres;
