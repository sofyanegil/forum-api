const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const createServer = require('../createServer');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const container = require('../../container');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /treads', () => {
    it('should response 401 when request missing auth', async () => {
      // Arrange
      const payload = {
        title: 'A Thread',
        body: 'A Body',
      };

      const server = await createServer({});

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const server = await createServer(container);
      const { accessToken } = await ServerTestHelper.registerAndGetToken(
        server
      );

      const payloadThread = {
        title: 'A Thread',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: payloadThread,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada'
      );
      await UsersTableTestHelper.cleanTable();
      await AuthenticationsTableTestHelper.cleanTable();
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const server = await createServer(container);
      const { accessToken } = await ServerTestHelper.registerAndGetToken(
        server
      );

      const payloadThread = {
        title: 'A Thread',
        body: 123,
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: payloadThread,
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
      await UsersTableTestHelper.cleanTable();
      await AuthenticationsTableTestHelper.cleanTable();
    });

    it('should response 201 and persisted thread', async () => {
      // Arrange
      const server = await createServer(container);
      const { accessToken } = await ServerTestHelper.registerAndGetToken(
        server
      );

      const payloadThread = {
        title: 'A Thread',
        body: 'A Body',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: payloadThread,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
      await UsersTableTestHelper.cleanTable();
      await AuthenticationsTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
    });
  });
});
