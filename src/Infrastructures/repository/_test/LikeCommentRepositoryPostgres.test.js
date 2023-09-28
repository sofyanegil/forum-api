/* eslint-disable operator-linebreak */
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikeCommentTableTestHelper = require('../../../../tests/LikeCommentTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const LikeCommentRepository = require('../../../Domains/likeComments/LikeCommentRepository');
const pool = require('../../database/postgres/pool');
const LikeCommentRepositoryPostgres = require('../LikeCommentRepositoryPostgres');

describe('LikeCommentRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({
      id: 'user-123',
      username: 'threadOwner',
    });
    await UsersTableTestHelper.addUser({
      id: 'user-456',
      username: 'commentOwner',
    });
    await UsersTableTestHelper.addUser({
      id: 'user-789',
      username: 'liker',
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
  });

  afterEach(async () => {
    await LikeCommentTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  it('should be instance of LikeCommentRepository domain', () => {
    const likeCommentRepositoryPostgres = new LikeCommentRepositoryPostgres(
      {},
      {}
    );
    expect(likeCommentRepositoryPostgres).toBeInstanceOf(LikeCommentRepository);
  });

  describe('verifyAvailableLike function', () => {
    it('should return false when like is not available', async () => {
      // Arrange
      const payload = {
        commentId: 'comment-123',
        userId: 'user-123',
      };

      const likeCommentRepositoryPostgres = new LikeCommentRepositoryPostgres(
        pool,
        {}
      );

      // Action
      const availableLike =
        await likeCommentRepositoryPostgres.verifyAvailableLike(
          payload.commentId,
          payload.userId
        );

      // Assert
      expect(availableLike).toEqual(false);
    });

    it('should return true when like is available', async () => {
      // Arrange
      const payload = {
        commentId: 'comment-123',
        userId: 'user-789',
      };

      const likeCommentRepositoryPostgres = new LikeCommentRepositoryPostgres(
        pool,
        {}
      );

      await LikeCommentTableTestHelper.addlikeComment({
        id: 'like-123',
        commentId: 'comment-123',
        userId: 'user-789',
      });

      // Action
      const availableLike =
        await likeCommentRepositoryPostgres.verifyAvailableLike(
          payload.commentId,
          payload.userId
        );

      // Assert
      expect(availableLike).toEqual(true);
    });
  });

  describe('likeComment function', () => {
    it('should persist like and return like id', async () => {
      // Arrange
      const payload = {
        commentId: 'comment-123',
        userId: 'user-789',
      };

      const fakeIdGenerator = () => '123';
      const likeCommentRepositoryPostgres = new LikeCommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      await likeCommentRepositoryPostgres.likeComment(
        payload.commentId,
        payload.userId
      );

      // Assert
      const like = await LikeCommentTableTestHelper.findLikeCommentByCommentId(
        payload.commentId
      );

      expect(like).toHaveLength(1);
    });
  });

  describe('unlikeComment function', () => {
    it('should delete like from database', async () => {
      // Arrange
      const payload = {
        commentId: 'comment-123',
        userId: 'user-789',
      };

      const fakeIdGenerator = () => '123';
      const likeCommentRepositoryPostgres = new LikeCommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      await likeCommentRepositoryPostgres.unlikeComment(
        payload.commentId,
        payload.userId
      );

      // Assert
      const like = await LikeCommentTableTestHelper.findLikeCommentByCommentId(
        payload.commentId
      );

      expect(like).toHaveLength(0);
    });
  });

  describe('getLikesCountByCommentId function', () => {
    it('should return number of likes', async () => {
      // Arrange
      const payload = {
        commentId: 'comment-123',
      };

      const fakeIdGenerator = () => '123';
      const likeCommentRepositoryPostgres = new LikeCommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      await LikeCommentTableTestHelper.addlikeComment({
        id: 'like-123',
        commentId: 'comment-123',
        userId: 'user-789',
      });

      // Action
      const likesCount =
        await likeCommentRepositoryPostgres.getLikesCountByCommentId(
          payload.commentId
        );

      // Assert
      expect(likesCount).toEqual(1);
    });
  });
});
