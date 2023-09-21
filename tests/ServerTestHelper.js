/* eslint-disable max-len */
/* istanbul ignore file */
const ServerTestHelper = {
  async registerAndGetToken(server) {
    const userPayload = {
      username: 'testuser',
      password: 'secret',
    };

    await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        ...userPayload,
        fullname: 'fullname',
      },
    });

    const responseAuth = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: userPayload,
    });

    const responseAuthJSON = JSON.parse(responseAuth.payload);
    const { accessToken } = responseAuthJSON.data;
    return { accessToken };
  },
};

module.exports = ServerTestHelper;
