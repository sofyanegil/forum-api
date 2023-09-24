/* eslint-disable function-paren-newline */
/* eslint-disable implicit-arrow-linebreak */
const GetThreadByIdUseCase = require('../GetThreadByIdUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');

describe('GetThreadByIdUseCase', () => {
  it('should orchestrating the get thread by id action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockReplyRepository = new ReplyRepository();
    /** mocking needed function */
    mockThreadRepository.verifyAvailableThread = jest.fn().mockImplementation();
    mockThreadRepository.getThreadById = jest.fn().mockImplementation(() =>
      Promise.resolve({
        id: 'thread-123',
        title: 'A Thread',
        body: 'A Body of Thread',
        date: '2021-08-08T07:59:57.000Z',
        username: 'user-123',
      })
    );
    mockCommentRepository.getCommentByThreadId = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve([
          {
            id: 'comment-123',
            username: 'dicoding',
            date: '2021-08-08T07:59:57.000Z',
            content: 'sebuah comment',
          },
          {
            id: 'comment-456',
            username: 'user',
            date: '2021-08-08T07:59:57.000Z',
            content: '**komentar telah dihapus**',
          },
        ])
      );
    mockReplyRepository.getRepliesByCommentId = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve([
          {
            id: 'reply-123',
            username: 'dicoding',
            date: '2021-08-08T07:59:57.000Z',
            content: 'sebuah balasan',
          },
        ])
      );

    /** creating use case instance */
    const getThreadByIdUseCase = new GetThreadByIdUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    await getThreadByIdUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith(
      useCasePayload.threadId
    );
    expect(mockThreadRepository.getThreadById).toBeCalledWith(
      useCasePayload.threadId
    );

    expect(mockCommentRepository.getCommentByThreadId).toBeCalledWith(
      useCasePayload.threadId
    );

    expect(mockReplyRepository.getRepliesByCommentId).toBeCalledWith(
      'comment-123'
    );
  });
});
