/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.createTable('user_comment_likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });
  pgm.addConstraint(
    'user_comment_likes',
    'fk_user_comment_likes.comment_id_comments.id',
    'FOREIGN KEY(comment_id) REFERENCES comments(id) ON DELETE CASCADE'
  );
  pgm.addConstraint(
    'user_comment_likes',
    'fk_user_comment_likes.user_id_users.id',
    'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE'
  );
};

exports.down = (pgm) => {
  pgm.dropConstraint(
    'user_comment_likes',
    'fk_user_comment_likes.comment_id_comments.id'
  );
  pgm.dropConstraint(
    'user_comment_likes',
    'fk_user_comment_likes.user_id_users.id'
  );
  pgm.dropTable('user_comment_likes');
};
