/* eslint-disable operator-linebreak */
const DetailThread = require('../../Domains/threads/entities/DetailThread');
const ThreadComment = require('../../Domains/comments/entities/ThreadComment');
const CommentReply = require('../../Domains/replies/entities/CommentReply');

class GetThreadByIdUseCase {
  constructor({
    threadRepository,
    commentRepository,
    replyRepository,
    likeCommentRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._likeCommentRepository = likeCommentRepository;
  }

  async execute(useCasePayload) {
    const { threadId } = useCasePayload;
    await this._threadRepository.verifyAvailableThread(threadId);
    const threadQuery = await this._threadRepository.getThreadById(threadId);
    const commentsQuery = await this._commentRepository.getCommentsByThreadId(
      threadId
    );

    const comments = await Promise.all(
      commentsQuery.map(async (comment) => {
        const threadComment = new ThreadComment(comment);
        threadComment.likeCount =
          await this._likeCommentRepository.getLikesCountByCommentId(
            comment.id
          );
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
