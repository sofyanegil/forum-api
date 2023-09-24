/* eslint-disable function-paren-newline */
/* eslint-disable implicit-arrow-linebreak */
const GetThreadByIdUseCase = require('../GetThreadByIdUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const ThreadComment = require('../../../Domains/comments/entities/ThreadComment');
const CommentReply = require('../../../Domains/replies/entities/CommentReply');

describe('GetThreadByIdUseCase', () => {
  it('should orchestrating the get thread by id action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
    };

    const expectedDetailThread = new DetailThread({
      id: 'thread-123',
      title: 'A Thread',
      body: 'A Body of Thread',
      date: '2021-08-08T07:59:57.000Z',
      username: 'user-123',
      comments: [
        new ThreadComment({
          id: 'comment-123',
          username: 'dicoding',
          content: 'sebuah komentar',
          date: '2021-08-08T07:59:57.000Z',
          is_delete: false,
          replies: [
            new CommentReply({
              id: 'reply-123',
              username: 'dicoding',
              date: '2021-08-08T07:59:57.000Z',
              content: 'sebuah balasan',
              is_delete: true,
            }),
          ],
        }),
      ],
    });

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
    mockCommentRepository.getCommentsByThreadId = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve([
          {
            id: 'comment-123',
            username: 'dicoding',
            content: 'sebuah komentar',
            date: '2021-08-08T07:59:57.000Z',
            is_delete: false,
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
            is_delete: true,
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
    const detailThread = await getThreadByIdUseCase.execute(useCasePayload);

    // Assert
    expect(detailThread).toStrictEqual(expectedDetailThread);
    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith(
      useCasePayload.threadId
    );
    expect(mockThreadRepository.getThreadById).toBeCalledWith(
      useCasePayload.threadId
    );

    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(
      useCasePayload.threadId
    );

    expect(mockReplyRepository.getRepliesByCommentId).toBeCalledWith(
      'comment-123'
    );
  });
});
