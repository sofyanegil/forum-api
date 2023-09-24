const DetailThread = require('../../Domains/threads/entities/DetailThread');
const ThreadComment = require('../../Domains/comments/entities/ThreadComment');
const CommentReply = require('../../Domains/replies/entities/CommentReply');

class GetThreadByIdUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    const { threadId } = useCasePayload;
    await this._threadRepository.verifyAvailableThread(threadId);
    const threadQuery = await this._threadRepository.getThreadById(threadId);
    const commentsQuery = await this._commentRepository.getCommentByThreadId(
      threadId
    );

    const comments = await Promise.all(
      commentsQuery.map(async (comment) => {
        const threadComment = new ThreadComment(comment);
        const replies = await this._replyRepository.getRepliesByCommentId(
          comment.id
        );
        threadComment.replies = replies.map((reply) => new CommentReply(reply));
        return threadComment;
      })
    );

    return new DetailThread({ ...threadQuery, comments });
  }
}
module.exports = GetThreadByIdUseCase;
