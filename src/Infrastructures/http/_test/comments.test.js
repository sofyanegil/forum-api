const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');
const container = require('../../container');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');

describe('/threads/{threadId}/comments endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    describe('when request without access token', () => {
      it('should response 401 when request missing auth', async () => {
        // Arrange
        const payload = { content: 'A Comment' };

        const server = await createServer({});

        // Action
        const response = await server.inject({
          method: 'POST',
          url: '/threads/thread-123/comments',
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

        await UsersTableTestHelper.addUser({ id: 'user-123' });
        await ThreadsTableTestHelper.addThread({
          owner: 'user-123',
          id: 'thread-123',
        });
      });

      afterEach(async () => {
        await ThreadsTableTestHelper.cleanTable();
        await AuthenticationsTableTestHelper.cleanTable();
        await UsersTableTestHelper.cleanTable();
      });

      it('should response 400 when request payload not contain needed property', async () => {
        // Arrange
        const payload = {
          title: 'A Comment ',
        };
        const server = await createServer(container);

        // Action
        const response = await server.inject({
          method: 'POST',
          url: '/threads/thread-123/comments',
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
          'tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada'
        );
      });

      it('should response 400 when request payload not meet data type specification', async () => {
        // Arrange
        const payload = { content: 123 };
        const server = await createServer(container);

        // Action
        const response = await server.inject({
          method: 'POST',
          url: '/threads/thread-123/comments',
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
          'tidak dapat membuat comment baru karena tipe data tidak sesuai'
        );
      });

      it('should response 201 and persisted comment', async () => {
        // Arrange
        const payload = {
          content: 'A Comment',
        };

        const server = await createServer(container);

        // Action
        const response = await server.inject({
          method: 'POST',
          url: '/threads/thread-123/comments',
          payload,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(201);
        expect(responseJson.status).toEqual('success');
        expect(responseJson.data.addedComment).toBeDefined();
      });
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    describe('when request without access token', () => {
      it('should response 401 when request missing auth', async () => {
        // Arrange
        const server = await createServer(container);

        // Action
        const response = await server.inject({
          method: 'DELETE',
          url: '/threads/thread-123/comments/comment-123',
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
      let ownerIdThread = null;
      let accessTokenOwnerComment = null;
      let ownerIdComment = null;

      beforeEach(async () => {
        const server = await createServer(container);

        // Register the user who owns the thread
        const resultThreadOwner = await ServerTestHelper.registerAndGetToken(
          server,
          { username: 'dicoding' }
        );
        accessTokenOwnerThread = resultThreadOwner.accessToken;
        ownerIdThread = resultThreadOwner.id;

        // Register the user who owns the comment
        const resultCommentOwner = await ServerTestHelper.registerAndGetToken(
          server,
          { username: 'user' }
        );
        accessTokenOwnerComment = resultCommentOwner.accessToken;
        ownerIdComment = resultCommentOwner.id;

        await ThreadsTableTestHelper.addThread({
          id: 'thread-123',
          owner: ownerIdThread,
        });

        await CommentsTableTestHelper.addComment({
          id: 'comment-123',
          owner: ownerIdComment,
          thread_id: 'thread-123',
        });
      });

      afterEach(async () => {
        await CommentsTableTestHelper.cleanTable();
        await ThreadsTableTestHelper.cleanTable();
        await AuthenticationsTableTestHelper.cleanTable();
        await UsersTableTestHelper.cleanTable();
      });

      it('should respond with 403 when user not the owner of the comment', async () => {
        // Arrange
        const server = await createServer(container);

        // Action
        const response = await server.inject({
          method: 'DELETE',
          url: '/threads/thread-123/comments/comment-123',
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
        const comments = await CommentsTableTestHelper.findCommentsById(
          'comment-123'
        );
        expect(comments).toHaveLength(1);
      });

      it('should respond with 404 when comment not available', async () => {
        // Arrange
        const server = await createServer(container);

        // Action
        const response = await server.inject({
          method: 'DELETE',
          url: '/threads/thread-123/comments/comment-456',
          headers: {
            Authorization: `Bearer ${accessTokenOwnerComment}`,
          },
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(404);
        expect(responseJson.status).toEqual('fail');
        expect(responseJson.message).toEqual('comment tidak ditemukan');
      });

      it('should respond with 200 and delete the comment', async () => {
        // Arrange
        const server = await createServer(container);

        // Action
        const response = await server.inject({
          method: 'DELETE',
          url: '/threads/thread-123/comments/comment-123',
          headers: {
            Authorization: `Bearer ${accessTokenOwnerComment}`,
          },
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(200);
        expect(responseJson.status).toEqual('success');

        const comments = await CommentsTableTestHelper.findCommentsById(
          'comment-123'
        );
        expect(comments).toHaveLength(0);
      });
    });
  });
});
