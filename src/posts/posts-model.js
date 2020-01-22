const PostsDao = require('./posts-dao');
const { check, validationResult } = require('express-validator');

class Post {
  constructor(title, content) {
    this.title = title;
    this.content = content;
  }

  add() {
    const postsDao = new PostsDao();
    return postsDao.add(this);
  }

  static validator() {
    return [
      check('title')
        .isLength({ min: 5 })
        .withMessage('The title must have at least 5 characters!'),
      check('content')
        .isLength({ max: 140 })
        .withMessage('The content must have less than 140 characters!')
    ];
  }

  static all() {
    const postsDao = new PostsDao();
    return postsDao.all();
  }
}

module.exports = Post;
