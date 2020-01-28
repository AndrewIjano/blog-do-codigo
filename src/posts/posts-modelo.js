const PostsDao = require('./posts-dao');
const InvalidArgumentError = require('../../erros').InvalidArgumentError;

class Post {
  constructor(post) {
    this.titulo = post.titulo;
    this.conteudo = post.conteudo;
    this.valida();
  }

  adiciona() {
    const postsDao = new PostsDao();
    return postsDao.adiciona(this);
  }

  valida() {
    if (typeof this.titulo !== 'string' || this.titulo.length < 5)
      throw new InvalidArgumentError(
        'O título precisa ter mais de 5 caracteres!'
      );

    if (typeof this.conteudo !== 'string' || this.conteudo.length > 140)
      throw new InvalidArgumentError(
        'O conteúdo do post não pode ter mais de 140 caracteres!'
      );
  }

  static lista() {
    const postsDao = new PostsDao();
    return postsDao.lista();
  }
}

module.exports = Post;
