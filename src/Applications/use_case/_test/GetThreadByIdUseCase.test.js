/* eslint-disable function-paren-newline */
/* eslint-disable implicit-arrow-linebreak */
const GetThreadByIdUseCase = require('../GetThreadByIdUseCase');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const ThreadComment = require('../../../Domains/comments/entities/ThreadComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('GetThreadByIdUseCase', () => {
  it('should orchestrating the get thread by id action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.verifyAvailableThread = jest.fn(() =>
      Promise.resolve()
    );
    mockThreadRepository.getThreadById = jest.fn(() =>
      Promise.resolve({
        id: 'thread-123',
        title: 'A Thread',
        body: 'A Body of Thread',
        date: '2021-08-08T07:59:57.000Z',
        username: 'user-123',
      })
    );

    mockCommentRepository.getCommentByThreadId = jest.fn(() =>
      Promise.resolve([
        {
          id: 'comment-123',
          username: 'dicoding',
          date: '2021-08-08T07:59:57.000Z',
          content: 'sebuah comment',
          is_deleted: false,
        },
        {
          id: 'comment-456',
          username: 'user',
          date: '2021-08-08T07:59:57.000Z',
          content: 'sebuah comment',
          is_deleted: true,
        },
      ])
    );

    /** creating use case instance */
    const getThreadByIdUseCase = new GetThreadByIdUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const detailThread = await getThreadByIdUseCase.execute(useCasePayload);

    // Assert
    expect(detailThread).toStrictEqual(
      new DetailThread({
        id: 'thread-123',
        title: 'A Thread',
        body: 'A Body of Thread',
        date: '2021-08-08T07:59:57.000Z',
        username: 'user-123',
        comments: [
          new ThreadComment({
            id: 'comment-123',
            username: 'dicoding',
            date: '2021-08-08T07:59:57.000Z',
            content: 'sebuah comment',
          }),
          new ThreadComment({
            id: 'comment-456',
            username: 'user',
            date: '2021-08-08T07:59:57.000Z',
            content: '**komentar telah dihapus**',
          }),
        ],
      })
    );
  });
});
