const DetailThread = require('../DetailThread');

describe('DetailThread entities', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
    };

    // Action and Assert
    expect(() => new DetailThread(payload)).toThrowError(
      'DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw error when payload does not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      title: true,
      body: {},
      date: 123,
      username: 123,
    };

    // Action and Assert
    expect(() => new DetailThread(payload)).toThrowError(
      'DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should create detailThread object correctly when comments is empty', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'A Thread',
      body: 'A Body of Thread',
      date: '2023-09-23T07:59:57.000Z',
      username: 'user-123',
    };

    // Action
    const detailThread = new DetailThread(payload);

    // Assert
    expect(detailThread.id).toEqual(payload.id);
    expect(detailThread.title).toEqual(payload.title);
    expect(detailThread.body).toEqual(payload.body);
    expect(detailThread.date).toEqual(payload.date);
    expect(detailThread.username).toEqual(payload.username);
    expect(detailThread.comments).toEqual([]);
  });

  it('should create detailThread object correctly when comments is not empty', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'A Thread',
      body: 'A Body of Thread',
      date: '2023-09-23T07:59:57.000Z',
      username: 'user-123',
      comments: [
        {
          id: 'comment-123',
          username: 'dicoding',
          date: '2023-09-23T07:59:57.000Z',
          content: 'sebuah comment',
        },
        {
          id: 'comment-456',
          username: 'user',
          date: '2023-09-23T07:59:57.000Z',
          content: 'sebuah comment',
        },
      ],
    };

    // Action
    const detailThread = new DetailThread(payload);

    // Assert
    expect(detailThread.id).toEqual(payload.id);
    expect(detailThread.title).toEqual(payload.title);
    expect(detailThread.body).toEqual(payload.body);
    expect(detailThread.date).toEqual(payload.date);
    expect(detailThread.username).toEqual(payload.username);
    expect(detailThread.comments).toEqual(payload.comments);
  });
});
