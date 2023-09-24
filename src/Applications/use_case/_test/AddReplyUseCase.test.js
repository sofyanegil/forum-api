/* eslint-disable function-paren-newline */
/* eslint-disable implicit-arrow-linebreak */
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const NewReply = require('../../../Domains/replies/entities/NewReply');
const AddReplyUseCase = require('../AddReplyUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');

describe('AddReplyUseCase', () => {
  it('should orchestrating the added reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      content: 'some reply',
      owner: 'user-123',
    };
    const expectedAddedReply = new AddedReply({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    });

    // mock dependency
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    // mock function
    mockThreadRepository.verifyAvailableThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyAvailableComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.addReply = jest.fn().mockImplementation(() =>
      Promise.resolve(
        new AddedReply({
          id: 'reply-123',
          content: useCasePayload.content,
          owner: useCasePayload.owner,
        })
      )
    );

    // mock use case dependency injection
    const getAddedReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const addedReply = await getAddedReplyUseCase.execute(useCasePayload);

    // Assert
    expect(addedReply).toStrictEqual(expectedAddedReply);
    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith(
      useCasePayload.threadId
    );
    expect(mockCommentRepository.verifyAvailableComment).toBeCalledWith(
      useCasePayload.commentId
    );
    expect(mockReplyRepository.addReply).toBeCalledWith(
      new NewReply({
        content: useCasePayload.content,
        commentId: useCasePayload.commentId,
        owner: useCasePayload.owner,
      })
    );
  });
});
