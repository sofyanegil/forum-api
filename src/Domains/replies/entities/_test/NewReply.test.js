const NewReply = require('../NewReply');

describe('a NewReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = { content: 'some reply' };

    // Action and Assert
    expect(() => new NewReply(payload)).toThrowError(
      'NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = { content: 123, commentId: true, owner: {} };

    // Action and Assert
    expect(() => new NewReply(payload)).toThrowError(
      'NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should create newReply object correctly', () => {
    // Arrange
    const payload = {
      content: 'some reply',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    // Action
    const { content, commentId, owner } = new NewReply(payload);

    // Assert
    expect(content).toEqual(payload.content);
    expect(commentId).toEqual(payload.commentId);
    expect(owner).toEqual(payload.owner);
  });
});
