/* eslint-disable operator-linebreak */
const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');
const container = require('../../container');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikeCommentTableTestHelper = require('../../../../tests/LikeCommentTableTestHelper');

describe('/threads/{threadId}/comments/{commentId}/likes endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });
  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    describe('when request without access token', () => {
      it('should response 401 when request missing auth', async () => {
        // Arrange
        const server = await createServer({});
        const payload = { like: true };

        // Action
        const response = await server.inject({
          method: 'PUT',
          url: '/threads/thread-123/comments/comment-123/likes',
          payload,
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(401);
        expect(responseJson.error).toEqual('Unauthorized');
        expect(responseJson.message).toEqual('Missing authentication');
      });
    });
    describe('when request with access token', () => {
      let accessTokenOwnerThread = null;
      let ownerThreadId = null;
      let accessTokenOwnerComment = null;
      let ownerCommentId = null;

      beforeEach(async () => {
        const server = await createServer(container);

        // Register the user who owns the thread
        const result = await ServerTestHelper.registerAndGetToken(server, {
          username: 'ownerThread',
        });
        accessTokenOwnerThread = result.accessToken;
        ownerThreadId = result.id;

        // Register the user who owns the comment
        const resultComment = await ServerTestHelper.registerAndGetToken(
          server,
          {
            username: 'ownerComment',
          }
        );
        accessTokenOwnerComment = resultComment.accessToken;
        ownerCommentId = resultComment.id;

        await ThreadsTableTestHelper.addThread({
          id: 'thread-123',
          owner: ownerThreadId,
        });
        await CommentsTableTestHelper.addComment({
          id: 'comment-123',
          owner: ownerCommentId,
          thread_id: 'thread-123',
        });
      });
      afterEach(async () => {
        await CommentsTableTestHelper.cleanTable();
        await ThreadsTableTestHelper.cleanTable();
        await AuthenticationsTableTestHelper.cleanTable();
        await UsersTableTestHelper.cleanTable();
      });

      it('should response 404 when thread not found', async () => {
        // Arrange
        const server = await createServer(container);

        // Action
        const response = await server.inject({
          method: 'PUT',
          url: '/threads/thread-xxx/comments/comment-123/likes',
          headers: {
            Authorization: `Bearer ${accessTokenOwnerThread}`,
          },
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(404);
        expect(responseJson.status).toEqual('fail');
        expect(responseJson.message).toEqual('thread tidak ditemukan');
      });

      it('should response 404 when comment not found', async () => {
        // Arrange
        const server = await createServer(container);

        // Action
        const response = await server.inject({
          method: 'PUT',
          url: '/threads/thread-123/comments/comment-xxx/likes',
          headers: {
            Authorization: `Bearer ${accessTokenOwnerThread}`,
          },
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(404);
        expect(responseJson.status).toEqual('fail');
        expect(responseJson.message).toEqual('comment tidak ditemukan');
      });

      it('should response 200 when reply successfully like', async () => {
        // Arrange
        const server = await createServer(container);

        // Action
        const response = await server.inject({
          method: 'PUT',
          url: '/threads/thread-123/comments/comment-123/likes',
          headers: {
            Authorization: `Bearer ${accessTokenOwnerThread}`,
          },
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(200);
        expect(responseJson.status).toEqual('success');
      });

      it('should response 200 when reply successfully unlike', async () => {
        // Arrange
        const server = await createServer(container);

        // Action
        await server.inject({
          method: 'PUT',
          url: '/threads/thread-123/comments/comment-123/likes',
          headers: {
            Authorization: `Bearer ${accessTokenOwnerComment}`,
          },
        });

        const response = await server.inject({
          method: 'PUT',
          url: '/threads/thread-123/comments/comment-123/likes',
          headers: {
            Authorization: `Bearer ${accessTokenOwnerComment}`,
          },
        });

        // Assert
        const resultLike =
          await LikeCommentTableTestHelper.findLikeCommentByCommentId(
            'comment-123',
            ownerCommentId
          );
        expect(resultLike).toHaveLength(0);
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(200);
        expect(responseJson.status).toEqual('success');
      });
    });
  });
});
