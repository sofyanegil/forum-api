const LikeCommentsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'likeComments',
  version: '1.0.0',
  register: async (server, { container }) => {
    const likeCommentsHandler = new LikeCommentsHandler(container);
    server.route(routes(likeCommentsHandler));
  },
};
