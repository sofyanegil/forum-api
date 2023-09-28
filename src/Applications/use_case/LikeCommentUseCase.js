/* eslint-disable operator-linebreak */
const LikeComment = require('../../Domains/likeComments/entity/LikeComment');

class LikeCommentUseCase {
  constructor({ threadRepository, commentRepository, likeCommentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._likeCommentRepository = likeCommentRepository;
  }

  async execute(useCasePayload) {
    const newLikeComment = new LikeComment(useCasePayload);
    await this._threadRepository.verifyAvailableThread(newLikeComment.threadId);
    await this._commentRepository.verifyAvailableComment(
      newLikeComment.commentId
    );

    const likeExist = await this._likeCommentRepository.verifyAvailableLike(
      newLikeComment.commentId,
      newLikeComment.userId
    );
    if (likeExist) {
      await this._likeCommentRepository.unlikeComment(
        newLikeComment.commentId,
        newLikeComment.userId
      );
    } else {
      await this._likeCommentRepository.likeComment(
        newLikeComment.commentId,
        newLikeComment.userId
      );
    }
  }
}

module.exports = LikeCommentUseCase;
