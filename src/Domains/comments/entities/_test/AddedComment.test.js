const AddedComment = require('../AddedComment');

describe('a AddedComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = { content: 'A Comment' };

    // Action and Assert
    expect(() => new AddedComment(payload)).toThrowError(
      'ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: true,
      owner: {},
    };

    // Action and Assert
    expect(() => new AddedComment(payload)).toThrowError(
      'ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should create addedComment object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'A Comment',
      owner: 'user-123',
    };

    // Action
    const addedComment = new AddedComment(payload);
    const { id, content, owner } = addedComment;
    // Assert
    expect(addedComment).toBeInstanceOf(AddedComment);
    expect(id).toEqual(payload.id);
    expect(content).toEqual(payload.content);
    expect(owner).toEqual(payload.owner);
  });
});
