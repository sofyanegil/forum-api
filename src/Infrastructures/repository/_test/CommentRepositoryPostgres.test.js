const pool = require('../../database/postgres/pool');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');

describe('CommentRepositoryPostgres', () => {
  it('should be instance of CommentRepository domain', () => {
    // Arrange
    const commentRepositoryPostgres = new CommentRepositoryPostgres({}, {});

    // Assert
    expect(commentRepositoryPostgres).toBeInstanceOf(CommentRepository);
  });
  describe('addComment function', () => {
    beforeEach(async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({
        owner: 'user-123',
        id: 'thread-123',
      });
    });

    afterEach(async () => {
      await ThreadsTableTestHelper.cleanTable();
      await UsersTableTestHelper.cleanTable();
      await CommentsTableTestHelper.cleanTable();
    });

    afterAll(async () => {
      await pool.end();
    });

    it('should persist add comment and return added comment correctly', async () => {
      // Arrange
      const owner = 'user-123';
      const threadId = 'thread-123';

      const newComment = new NewComment({
        content: 'A Comment',
        owner,
        threadId,
      });

      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      await commentRepositoryPostgres.addComment(owner, threadId, newComment);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentsById(
        'comment-123'
      );
      expect(comments).toHaveLength(1);
    });

    it('should return added comment correctly', async () => {
      // Arrange
      const owner = 'user-123';
      const threadId = 'thread-123';

      const newComment = new NewComment({
        content: 'A Comment',
        owner,
        threadId,
      });

      const fakeIdGenerator = () => '123'; // stub!

      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(
        owner,
        threadId,
        newComment
      );

      // Assert
      expect(addedComment).toStrictEqual(
        new AddedComment({
          id: 'comment-123',
          content: newComment.content,
          owner: newComment.owner,
        })
      );
    });
  });
});
