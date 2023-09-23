const pool = require('../../database/postgres/pool');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgres', () => {
  afterAll(async () => {
    await pool.end();
  });
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

    it('should persist add comment and return added comment correctly', async () => {
      // Arrange
      const newComment = new NewComment({
        content: 'A Comment',
        owner: 'user-123',
        threadId: 'thread-123',
      });

      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      await commentRepositoryPostgres.addComment(newComment);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentsById(
        'comment-123'
      );
      expect(comments).toHaveLength(1);
    });

    it('should return added comment correctly', async () => {
      // Arrange
      const newComment = new NewComment({
        content: 'A Comment',
        owner: 'user-123',
        threadId: 'thread-123',
      });

      const fakeIdGenerator = () => '123'; // stub!

      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(
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

  describe('verifyAvailableComment function', () => {
    afterEach(async () => {
      await UsersTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await CommentsTableTestHelper.cleanTable();
    });

    it('should throw NotFoundError when comment not available', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyAvailableComment('comment-123')
      ).rejects.toThrowError(NotFoundError);
    });
    it('should not throw NotFoundError when comment available', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({
        owner: 'user-123',
        id: 'thread-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
        thread_id: 'thread-123',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyAvailableComment('comment-123')
      ).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyCommentOwner function', () => {
    beforeEach(async () => {
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'ownerThread',
      });
      await UsersTableTestHelper.addUser({
        id: 'user-456',
        username: 'ownerComment',
      });
      await ThreadsTableTestHelper.addThread({
        owner: 'user-123',
        id: 'thread-123',
      });
    });
    afterEach(async () => {
      await CommentsTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await UsersTableTestHelper.cleanTable();
    });

    it('should throw AuthorizationError when ownerComment not match', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-456',
        thread_id: 'thread-123',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-123')
      ).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when ownerComment match', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-456',
        thread_id: 'thread-123',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-456')
      ).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('deleteCommentById function', () => {
    beforeEach(async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({
        owner: 'user-123',
        id: 'thread-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
        thread_id: 'thread-123',
      });
    });

    afterEach(async () => {
      await CommentsTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await UsersTableTestHelper.cleanTable();
    });

    it('should delete comment', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      await commentRepositoryPostgres.deleteCommentById('comment-123');

      // Assert
      const comments = await CommentsTableTestHelper.findCommentsById(
        'comment-123'
      );

      expect(comments).toHaveLength(0);
    });
  });

  describe('getCommentByThreadId function', () => {
    afterEach(async () => {
      await CommentsTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await UsersTableTestHelper.cleanTable();
    });
    it('should return comments correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'ownerThread',
      });
      await UsersTableTestHelper.addUser({
        id: 'user-456',
        username: 'ownerComment',
      });
      await UsersTableTestHelper.addUser({
        id: 'user-789',
        username: 'ownerDeletedComment',
      });

      await ThreadsTableTestHelper.addThread({
        owner: 'user-123',
        id: 'thread-123',
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-456',
        thread_id: 'thread-123',
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-456',
        owner: 'user-789',
        thread_id: 'thread-123',
      });
      await CommentsTableTestHelper.deleteCommentById('comment-456');

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comments = await commentRepositoryPostgres.getCommentByThreadId(
        'thread-123'
      );

      // Assert
      expect(comments).toHaveLength(2);
      expect(comments[0]).toStrictEqual({
        id: 'comment-123',
        username: 'ownerComment',
        content: 'A Comment',
        date: expect.any(String),
        is_delete: false,
      });
      expect(comments[1]).toStrictEqual({
        id: 'comment-456',
        username: 'ownerDeletedComment',
        content: 'A Comment',
        date: expect.any(String),
        is_delete: true,
      });
    });
  });
});
