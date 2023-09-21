const NewThread = require('../../Domains/threads/entities/NewThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(ownerId, useCasePayload) {
    const newThread = new NewThread({ ...useCasePayload, owner: ownerId });
    return this._threadRepository.addThread(ownerId, newThread);
  }
}

module.exports = AddThreadUseCase;
