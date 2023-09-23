const autoBind = require('auto-bind');
const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const GetThreadByIdUseCase = require('../../../../Applications/use_case/GetThreadByIdUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    autoBind(this);
  }

  async postThreadHandler(request, h) {
    const { id: owner } = request.auth.credentials;

    const addedThreadUseCase = this._container.getInstance(
      AddThreadUseCase.name
    );

    const addedThread = await addedThreadUseCase.execute({
      ...request.payload,
      owner,
    });

    const response = h.response({
      status: 'success',
      data: { addedThread },
    });
    response.code(201);
    return response;
  }

  async getThreadByIdHandler(request) {
    const { threadId } = request.params;

    const getThreadByIdUseCase = this._container.getInstance(
      GetThreadByIdUseCase.name
    );

    const thread = await getThreadByIdUseCase.execute({ threadId });

    return {
      status: 'success',
      data: { thread },
    };
  }
}

module.exports = ThreadsHandler;
