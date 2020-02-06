const postsDao = require('./posts-dao');
const { InvalidArgumentError } = require('../../erros');

class Post {
  constructor(post) {
    this.titulo = post.titulo;
    this.conteudo = post.conteudo;
    this.valida();
  }

  adiciona() {
    return postsDao.adiciona(this);
  }

  valida() {
    this.campoStringNaoNulo(this.titulo, 'título');
    this.campoTamanhoMinimo(this.titulo, 'título', 5);
    
    this.campoStringNaoNulo(this.conteudo, 'conteúdo');
    this.campoTamanhoMaximo(this.conteudo, 'conteúdo', 140);
  }

  campoStringNaoNulo(valor, nome) {
    if (typeof valor !== 'string' || valor === 0)
      throw new InvalidArgumentError(`É necessário preencher o campo ${nome}!`);
  }

  campoTamanhoMinimo(valor, nome, minimo) {
    if (valor.length < minimo)
      throw new InvalidArgumentError(
        `O campo ${nome} precisa ser maior que ${minimo} caracteres!`
      );
  }

  campoTamanhoMaximo(valor, nome, maximo) {
    if (valor.length > maximo)
      throw new InvalidArgumentError(
        `O campo ${nome} precisa ser menor que ${maximo} caracteres!`
      );
  }

  static lista() {
    return postsDao.lista();
  }
}

module.exports = Post;
