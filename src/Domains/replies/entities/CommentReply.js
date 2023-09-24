class CommentReply {
  constructor(payload) {
    this._verifyPayload(payload);
    const { id, content, date, username, is_delete } = payload;

    this.id = id;
    this.content = this._checkContent(content, is_delete);
    this.date = date;
    this.username = username;
  }

  _verifyPayload({ id, content, date, username }) {
    if (!id || !content || !date || !username) {
      throw new Error('REPLY_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string' ||
      typeof content !== 'string' ||
      typeof date !== 'string' ||
      typeof username !== 'string'
    ) {
      throw new Error('REPLY_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  _checkContent(content, is_delete) {
    return is_delete ? '**balasan telah dihapus**' : content;
  }
}

module.exports = CommentReply;
