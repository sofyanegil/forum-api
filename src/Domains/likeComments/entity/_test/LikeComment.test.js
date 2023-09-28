const LikeComment = require('../LikeComment');

describe('LikeComment entity', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = { threadId: 'thread-123' };

    // Action and Assert
    expect(() => new LikeComment(payload)).toThrowError(
      'LIKE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      threadId: 'thread-123',
      commentId: true,
      userId: {},
    };

    // Action and Assert
    expect(() => new LikeComment(payload)).toThrowError(
      'LIKE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should create LikeComment object correctly', () => {
    // Arrange
    const payload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    // Action
    const { threadId, commentId, userId } = new LikeComment(payload);

    // Assert
    expect(threadId).toEqual(payload.threadId);
    expect(commentId).toEqual(payload.commentId);
    expect(userId).toEqual(payload.userId);
  });
});
