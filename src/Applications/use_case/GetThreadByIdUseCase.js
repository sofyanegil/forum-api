const DetailThread = require('../../Domains/threads/entities/DetailThread');
const ThreadComment = require('../../Domains/comments/entities/ThreadComment');

class GetThreadByIdUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const { threadId } = useCasePayload;
    await this._threadRepository.verifyAvailableThread(threadId);
    const threadQuery = await this._threadRepository.getThreadById(threadId);
    const commentsQuery = await this._commentRepository.getCommentByThreadId(
      threadId
    );
    const comments = commentsQuery.map((comment) => new ThreadComment(comment));
    return new DetailThread({ ...threadQuery, comments });
  }
}
module.exports = GetThreadByIdUseCase;
