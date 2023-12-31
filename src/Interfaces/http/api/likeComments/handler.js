const autoBind = require('auto-bind');
const LikeCommentUseCase = require('../../../../Applications/use_case/LikeCommentUseCase');

class LikeCommentsHandler {
  constructor(container) {
    this._container = container;

    autoBind(this);
  }

  async putLikeCommentHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { threadId, commentId } = request.params;

    const likeCommentUseCase = this._container.getInstance(
      LikeCommentUseCase.name
    );

    await likeCommentUseCase.execute({ threadId, commentId, userId });

    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }
}

module.exports = LikeCommentsHandler;
