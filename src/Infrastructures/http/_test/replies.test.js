const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');
const container = require('../../container');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');

describe('/threads/{threadId}/comments/{commentId}/replies endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    describe('when request without access token', () => {
      it('should response 401 when request missing auth', async () => {
        // Arrange
        const payload = { content: 'A Reply' };

        const server = await createServer({});

        // Action
        const response = await server.inject({
          method: 'POST',
          url: '/threads/thread-123/comments/comment-123/replies',
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
      let accessToken = null;

      beforeEach(async () => {
        const server = await createServer(container);
        const result = await ServerTestHelper.registerAndGetToken(server, {
          username: 'dicoding',
        });
        accessToken = result.accessToken;

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
        });
      });

      afterEach(async () => {
        await CommentsTableTestHelper.cleanTable();
        await ThreadsTableTestHelper.cleanTable();
        await AuthenticationsTableTestHelper.cleanTable();
        await UsersTableTestHelper.cleanTable();
      });

      it('should response 400 when request payload not contain needed property', async () => {
        // Arrange
        const payload = { title: 'A Reply ' };
        const server = await createServer(container);

        // Action
        const response = await server.inject({
          method: 'POST',
          url: '/threads/thread-123/comments/comment-123/replies',
          payload,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(400);
        expect(responseJson.status).toEqual('fail');
        expect(responseJson.message).toEqual(
          'tidak dapat membuat reply baru karena properti yang dibutuhkan tidak ada'
        );
      });

      it('should response 400 when request payload not meet data type specification', async () => {
        // Arrange
        const payload = { content: 123 };
        const server = await createServer(container);

        // Action
        const response = await server.inject({
          method: 'POST',
          url: '/threads/thread-123/comments/comment-123/replies',
          payload,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(400);
        expect(responseJson.status).toEqual('fail');
        expect(responseJson.message).toEqual(
          'tidak dapat membuat reply baru karena tipe data tidak sesuai'
        );
      });

      it('should response 201 and persisted comment', async () => {
        // Arrange
        const payload = { content: 'A Reply' };

        const server = await createServer(container);

        // Action
        const response = await server.inject({
          method: 'POST',
          url: '/threads/thread-123/comments/comment-123/replies',
          payload,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(201);
        expect(responseJson.status).toEqual('success');
        expect(responseJson.data.addedReply).toBeDefined();
      });
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    describe('when request without access token', () => {
      it('should response 401 when request missing auth', async () => {
        // Arrange
        const server = await createServer({});

        // Action
        const response = await server.inject({
          method: 'DELETE',
          url: '/threads/thread-123/comments/comment-123/replies/reply-123',
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
      let accessTokenOwnerReply = null;
      let ownerReplyId = null;

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

        // Register the user who owns the reply
        const resultReply = await ServerTestHelper.registerAndGetToken(server, {
          username: 'ownerReply',
        });
        accessTokenOwnerReply = resultReply.accessToken;
        ownerReplyId = resultReply.id;

        await ThreadsTableTestHelper.addThread({
          id: 'thread-123',
          owner: ownerThreadId,
        });
        await CommentsTableTestHelper.addComment({
          id: 'comment-123',
          owner: ownerCommentId,
          thread_id: 'thread-123',
        });
        await RepliesTableTestHelper.addReply({
          id: 'reply-123',
          owner: ownerReplyId,
          comment_id: 'comment-123',
        });
      });
      afterEach(async () => {
        await RepliesTableTestHelper.cleanTable();
        await CommentsTableTestHelper.cleanTable();
        await ThreadsTableTestHelper.cleanTable();
        await AuthenticationsTableTestHelper.cleanTable();
        await UsersTableTestHelper.cleanTable();
      });

      it('should response 404 when reply not found', async () => {
        // Arrange
        const server = await createServer(container);

        // Action
        const response = await server.inject({
          method: 'DELETE',
          url: '/threads/thread-123/comments/comment-123/replies/reply-999',
          headers: {
            Authorization: `Bearer ${accessTokenOwnerComment}`,
          },
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(404);
        expect(responseJson.status).toEqual('fail');
        expect(responseJson.message).toEqual('reply tidak ditemukan');
      });

      it('should response 403 when user not the owner of the reply', async () => {
        // Arrange
        const server = await createServer(container);

        // Action
        const response = await server.inject({
          method: 'DELETE',
          url: '/threads/thread-123/comments/comment-123/replies/reply-123',
          headers: {
            Authorization: `Bearer ${accessTokenOwnerThread}`,
          },
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(403);
        expect(responseJson.status).toEqual('fail');
        expect(responseJson.message).toEqual(
          'anda tidak berhak mengakses resource ini'
        );
      });

      it('should response 200 when reply successfully deleted', async () => {
        // Arrange
        const server = await createServer(container);

        // Action
        const response = await server.inject({
          method: 'DELETE',
          url: '/threads/thread-123/comments/comment-123/replies/reply-123',
          headers: {
            Authorization: `Bearer ${accessTokenOwnerReply}`,
          },
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(200);
        expect(responseJson.status).toEqual('success');
      });
    });
  });
});
