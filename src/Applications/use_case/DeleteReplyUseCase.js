/* eslint-disable operator-linebreak */

const DeleteReply = require('../../Domains/replies/entities/DeleteReply');

/* eslint-disable object-curly-newline */
class DeleteReplyUseCase {
  constructor({ replyRepository, threadRepository, commentRepository }) {
    this._replyRepository = replyRepository;
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const deleteReply = new DeleteReply(useCasePayload);
    await this._threadRepository.verifyAvailableThread(deleteReply.threadId);
    await this._commentRepository.verifyAvailableComment(deleteReply.commentId);
    await this._replyRepository.verifyAvailableReply(deleteReply.replyId);
    await this._replyRepository.verifyReplyOwner(
      deleteReply.replyId,
      deleteReply.owner
    );
    await this._replyRepository.deleteReplyById(deleteReply.replyId);
  }
}

module.exports = DeleteReplyUseCase;
