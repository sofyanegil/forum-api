const CommentReply = require('../CommentReply');

describe('a CommentReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = { id: 'reply-123' };

    // Action and Assert
    expect(() => new CommentReply(payload)).toThrowError(
      'REPLY_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      content: true,
      date: {},
      username: 123,
      is_delete: 'false',
    };

    // Action and Assert
    expect(() => new CommentReply(payload)).toThrowError(
      'REPLY_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should create commentReply object correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'sebuah balasan',
      date: '2023-08-23T07:59:57.000Z',
      username: 'dicoding',
      is_delete: false,
    };

    // Action
    const commentReply = new CommentReply(payload);

    // Assert
    expect(commentReply.id).toEqual(payload.id);
    expect(commentReply.content).toEqual(payload.content);
    expect(commentReply.date).toEqual(payload.date);
    expect(commentReply.username).toEqual(payload.username);
  });

  it('should create commentReply object correctly when is_delete is true', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'sebuah balasan',
      date: '2023-08-23T07:59:57.000Z',
      username: 'dicoding',
      is_delete: true,
    };

    // Action
    const commentReply = new CommentReply(payload);

    // Assert
    expect(commentReply.id).toEqual(payload.id);
    expect(commentReply.content).toEqual('**balasan telah dihapus**');
    expect(commentReply.date).toEqual(payload.date);
    expect(commentReply.username).toEqual(payload.username);
  });
});
