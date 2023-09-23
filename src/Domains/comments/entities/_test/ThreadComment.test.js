const ThreadComment = require('../ThreadComment');

describe('a ThreadComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
    };

    // Action and Assert
    expect(() => new ThreadComment(payload)).toThrowError(
      'THREAD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      username: true,
      date: {},
      content: 123,
    };

    // Action and Assert
    expect(() => new ThreadComment(payload)).toThrowError(
      'THREAD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should create threadComment object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'dicoding',
      date: '2023-09-23T07:59:57.000Z',
      content: 'sebuah comment',
      is_delete: false,
    };

    // Action
    const threadComment = new ThreadComment(payload);

    // Assert
    expect(threadComment.id).toEqual(payload.id);
    expect(threadComment.username).toEqual(payload.username);
    expect(threadComment.date).toEqual(payload.date);
    expect(threadComment.content).toEqual(payload.content);
  });

  it('should create threadComment object correctly when is_delete is true', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'dicoding',
      date: '2023-09-23T07:59:57.000Z',
      content: 'sebuah comment',
      is_delete: true,
    };

    // Action
    const threadComment = new ThreadComment(payload);

    // Assert
    expect(threadComment.id).toEqual(payload.id);
    expect(threadComment.username).toEqual(payload.username);
    expect(threadComment.date).toEqual(payload.date);
    expect(threadComment.content).toEqual('**komentar telah dihapus**');
  });
});
