/* eslint-disable max-len */
/* istanbul ignore file */
const ServerTestHelper = {
  async registerAndGetToken(server, { username = 'dicoding' }) {
    const userPayload = {
      username,
      password: 'secret',
    };

    const responseRegister = await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        ...userPayload,
        fullname: 'fullname',
      },
    });

    const responseRegisterJSON = JSON.parse(responseRegister.payload);
    const { id } = responseRegisterJSON.data.addedUser;

    const responseAuth = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: userPayload,
    });

    const responseAuthJSON = JSON.parse(responseAuth.payload);
    const { accessToken } = responseAuthJSON.data;
    return { accessToken, id };
  },
};

module.exports = ServerTestHelper;
