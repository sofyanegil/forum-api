const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const NewReply = require('../../../Domains/replies/entities/NewReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('ReplyRepositoryPostgres', () => {
  afterAll(async () => {
    await pool.end();
  });

  it('should tobe instance of ReplyRepository domain', () => {
    const replyRepositoryPostgres = new ReplyRepositoryPostgres({}, {});
    expect(replyRepositoryPostgres).toBeInstanceOf(ReplyRepository);
  });

  describe('addReply function', () => {
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
      await CommentsTableTestHelper.addComment({
        owner: 'user-456',
        id: 'comment-123',
        threadId: 'thread-123',
      });
    });

    afterEach(async () => {
      await ThreadsTableTestHelper.cleanTable();
      await UsersTableTestHelper.cleanTable();
      await CommentsTableTestHelper.cleanTable();
    });

    it('should persist add reply and return added reply correctly', async () => {
      // Arrange
      const newReply = new NewReply({
        content: 'A Reply',
        commentId: 'comment-123',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123'; // stub!

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action

      await replyRepositoryPostgres.addReply(newReply);

      // Assert
      const replies = await RepliesTableTestHelper.findRepliesById('reply-123');

      expect(replies).toHaveLength(1);
    });

    it('should return added reply correctly', async () => {
      // Arrange
      const newReply = new NewReply({
        content: 'A Reply',
        commentId: 'comment-123',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123'; // stub!

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const addedReply = await replyRepositoryPostgres.addReply(newReply);

      // Assert
      expect(addedReply).toStrictEqual(
        new AddedReply({
          id: 'reply-123',
          content: newReply.content,
          owner: newReply.owner,
        })
      );
    });
  });

  describe('verifyAvailableReply function', () => {
    afterEach(async () => {
      await RepliesTableTestHelper.cleanTable();
      await CommentsTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await UsersTableTestHelper.cleanTable();
    });

    it('should throw NotFoundError when reply not available', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.verifyAvailableReply('reply-123')
      ).rejects.toThrowError('reply tidak ditemukan');
    });

    it('should not throw NotFoundError when reply available', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'ownerThread',
      });
      await UsersTableTestHelper.addUser({
        id: 'user-456',
        username: 'ownerComment',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-456',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        commentId: 'comment-123',
        owner: 'user-123',
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.verifyAvailableReply('reply-123')
      ).resolves.not.toThrowError('reply tidak ditemukan');
    });
  });

  describe('verifyReplyOwner function', () => {
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
        id: 'thread-123',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-456',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        commentId: 'comment-123',
        owner: 'user-123',
      });
    });

    afterEach(async () => {
      await RepliesTableTestHelper.cleanTable();
      await CommentsTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await UsersTableTestHelper.cleanTable();
    });
    it('should throw AuthorizationError when reply not owned by owner', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-456')
      ).rejects.toThrowError(AuthorizationError);
    });
    it('should not throw AuthorizationError when reply owned by owner', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-123')
      ).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('deleteReplyById function', () => {
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
        id: 'thread-123',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-456',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        commentId: 'comment-123',
        owner: 'user-123',
      });
    });
    afterEach(async () => {
      await RepliesTableTestHelper.cleanTable();
      await CommentsTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await UsersTableTestHelper.cleanTable();
    });

    it('should delete reply', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      await replyRepositoryPostgres.deleteReplyById('reply-123');

      // Assert
      const replies = await RepliesTableTestHelper.findRepliesById('reply-123');
      expect(replies).toHaveLength(0);
    });
  });
});
