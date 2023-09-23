const createServer = require('../createServer');
const container = require('../../container');
const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /treads', () => {
    describe('when request without access token', () => {
      it('should response 401 when request missing auth', async () => {
        // Arrange
        const requestPayload = {
          title: 'A Thread',
          body: 'A Body',
        };

        const server = await createServer({});

        // Action
        const response = await server.inject({
          method: 'POST',
          url: '/threads',
          payload: requestPayload,
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
      });

      afterEach(async () => {
        await ThreadsTableTestHelper.cleanTable();
        await AuthenticationsTableTestHelper.cleanTable();
        await UsersTableTestHelper.cleanTable();
      });

      it('should response 400 when request payload not contain needed property', async () => {
        // Arrange
        const requestPayload = {
          title: 'A Thread',
        };
        const server = await createServer(container);

        // Action
        const response = await server.inject({
          method: 'POST',
          url: '/threads',
          payload: requestPayload,
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(400);
        expect(responseJson.status).toEqual('fail');
        expect(responseJson.message).toEqual(
          'tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada'
        );
      });

      it('should response 400 when request payload not meet data type specification', async () => {
        // Arrange
        const requestPayload = {
          title: 'A Thread',
          body: 123,
        };

        const server = await createServer(container);

        // Action
        const response = await server.inject({
          method: 'POST',
          url: '/threads',
          payload: requestPayload,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(400);
        expect(responseJson.status).toEqual('fail');
        expect(responseJson.message).toEqual(
          'tidak dapat membuat thread baru karena tipe data tidak sesuai'
        );
      });

      it('should response 201 and persisted thread', async () => {
        // Arrange
        const requestPayload = {
          title: 'A Thread',
          body: 'A Body',
        };

        const server = await createServer(container);

        // Action
        const response = await server.inject({
          method: 'POST',
          url: '/threads',
          payload: requestPayload,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(201);
        expect(responseJson.status).toEqual('success');
        expect(responseJson.data.addedThread).toBeDefined();
      });
    });
  });
});
