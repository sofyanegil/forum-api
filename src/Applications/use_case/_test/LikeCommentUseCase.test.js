const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const LikeCommentUseCase = require('../LikeCommentUseCase');
const LikeCommentRepository = require('../../../Domains/likeComments/LikeCommentRepository');

describe('LikeCommentUseCase', () => {
  it('should orchestrating the like comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    // mock dependency
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeCommentRepository = new LikeCommentRepository();

    // mock function
    mockThreadRepository.verifyAvailableThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    mockCommentRepository.verifyAvailableComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    mockLikeCommentRepository.verifyAvailableLike = jest
      .fn()
      .mockImplementation(() => Promise.resolve(false));

    mockLikeCommentRepository.likeComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    mockLikeCommentRepository.unlikeComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    // create use case instance
    const likeCommentUsecase = new LikeCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeCommentRepository: mockLikeCommentRepository,
    });

    // Action
    await likeCommentUsecase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyAvailableThread).toHaveBeenCalledWith(
      useCasePayload.threadId
    );
    expect(mockCommentRepository.verifyAvailableComment).toHaveBeenCalledWith(
      useCasePayload.commentId
    );
    expect(mockLikeCommentRepository.verifyAvailableLike);
    expect(mockLikeCommentRepository.likeComment).toHaveBeenCalledWith(
      useCasePayload.commentId,
      useCasePayload.userId
    );
    expect(mockLikeCommentRepository.unlikeComment).not.toHaveBeenCalled();
  });

  it('should orchestrating the unlike comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    // mock dependency
    // mock dependency
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeCommentRepository = new LikeCommentRepository();

    // mock function
    mockThreadRepository.verifyAvailableThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    mockCommentRepository.verifyAvailableComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    mockLikeCommentRepository.verifyAvailableLike = jest
      .fn()
      .mockImplementation(() => Promise.resolve(true));

    mockLikeCommentRepository.likeComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    mockLikeCommentRepository.unlikeComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    // create use case instance
    const likeCommentUseCase = new LikeCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeCommentRepository: mockLikeCommentRepository,
    });

    // Action
    await likeCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyAvailableThread).toHaveBeenCalledWith(
      useCasePayload.threadId
    );
    expect(mockCommentRepository.verifyAvailableComment).toHaveBeenCalledWith(
      useCasePayload.commentId
    );
    expect(mockLikeCommentRepository.verifyAvailableLike);
    expect(mockLikeCommentRepository.unlikeComment).toHaveBeenCalledWith(
      useCasePayload.commentId,
      useCasePayload.userId
    );
    expect(mockLikeCommentRepository.likeComment).not.toHaveBeenCalled();
  });
});
