const NewComment = require('../../Domains/comments/entities/NewComment');

class AddCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(owner, threadId, useCasePayload) {
    await this._threadRepository.verifyAvailableThread(threadId);
    const { content } = useCasePayload;
    const newComment = new NewComment({
      content,
      owner,
      threadId,
    });
    return this._commentRepository.addComment(owner, threadId, newComment);
  }
}

module.exports = AddCommentUseCase;
