class ThreadComment {
  constructor(payload) {
    this._verifyPayload(payload);
    const { id, username, date, content, is_delete } = payload;

    this.id = id;
    this.username = username;
    this.date = date;
    this.content = this._checkContent(content, is_delete);
  }

  _verifyPayload({ id, username, date, content }) {
    if (!id || !username || !date || !content) {
      throw new Error('THREAD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }
    if (
      typeof id !== 'string' ||
      typeof username !== 'string' ||
      typeof date !== 'string' ||
      typeof content !== 'string'
    ) {
      throw new Error('THREAD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  _checkContent(content, is_delete) {
    return is_delete ? '**komentar telah dihapus**' : content;
  }
}
module.exports = ThreadComment;
