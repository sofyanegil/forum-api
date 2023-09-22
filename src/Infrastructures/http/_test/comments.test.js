const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');
const container = require('../../container');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');

describe('/threads/{threadId}/comments endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    describe('when request without access token', () => {
      afterEach(async () => {
        await ThreadsTableTestHelper.cleanTable();
        await UsersTableTestHelper.cleanTable();
      });

      it('should response 401 when request missing auth', async () => {
        // Arrange
        await UsersTableTestHelper.addUser({ id: 'user-123' });
        await ThreadsTableTestHelper.addThread({
          owner: 'user-123',
          id: 'thread-123',
        });
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
        const result = await ServerTestHelper.registerAndGetToken(server);
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
});
