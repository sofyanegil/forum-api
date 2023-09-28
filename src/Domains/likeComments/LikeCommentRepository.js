class LikeCommentRepository {
  async likeComment(commentId, userId) {
    throw new Error('LIKE_COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async unlikeComment(commentId, userId) {
    throw new Error('LIKE_COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async verifyAvailableLike(commentId, userId) {
    throw new Error('LIKE_COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async getLikesCountByCommentId(commentId) {
    throw new Error('LIKE_COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }
}

module.exports = LikeCommentRepository;
