const PostsDao = require('./posts-dao');
const { check, validationResult } = require('express-validator');

class Post {
  constructor(post) {
    this.titulo = post.titulo;
    this.conteudo = post.conteudo;
  }

  adiciona() {
    const postsDao = new PostsDao();
    return postsDao.adiciona(this);
  }

  static validador() {
    return [
      check('titulo')
        .isLength({ min: 5 })
        .withMessage('O título precisa ter mais de 5 caracteres!'),
      check('conteudo')
        .isLength({ max: 140 })
        .withMessage('O conteúdo do post não pode ter mais de 140 caracteres!')
    ];
  }

  static lista() {
    const postsDao = new PostsDao();
    return postsDao.lista();
  }
}

module.exports = Post;
