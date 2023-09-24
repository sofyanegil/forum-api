/* eslint-disable object-curly-newline */
const NewReply = require('../../Domains/replies/entities/NewReply');

class AddReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    const { threadId, commentId, content, owner } = useCasePayload;
    await this._threadRepository.verifyAvailableThread(threadId);
    await this._commentRepository.verifyAvailableComment(commentId);
    const newReply = new NewReply({
      content,
      commentId,
      owner,
    });

    return this._replyRepository.addReply(newReply);
  }
}

module.exports = AddReplyUseCase;
