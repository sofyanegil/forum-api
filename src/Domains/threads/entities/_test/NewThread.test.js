const NewThread = require('../NewThread');

describe('a NewThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payloadTitle = { title: 'A Thread' };
    const payloadBody = { body: 'A Body of Thread' };

    // Action and Assert
    expect(() => new NewThread(payloadTitle)).toThrowError(
      'NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY'
    );
    expect(() => new NewThread(payloadBody)).toThrowError(
      'NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      title: 'A Thread',
      body: true,
      owner: {},
    };

    // Action and Assert
    expect(() => new NewThread(payload)).toThrowError(
      'NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should create newThread object correctly', () => {
    // Arrange
    const payload = {
      title: 'A Thread',
      body: 'A Body of Thread',
      owner: 'user-123',
    };

    // Action
    const newThread = new NewThread(payload);
    const { title, body, owner } = newThread;

    // Assert
    expect(newThread).toBeInstanceOf(NewThread);
    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(owner).toEqual(payload.owner);
  });
});
