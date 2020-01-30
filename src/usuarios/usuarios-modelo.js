const usuariosDao = require('./usuarios-dao');
const { InvalidArgumentError } = require('../../erros');

class Usuario {
  constructor(usuario) {
    this.nome = usuario.nome;
    this.email = usuario.email;
    this.senha = usuario.senha;

    this.valida();
  }

  adiciona() {
    return usuariosDao.adiciona(this);
  }

  valida() {
    if (this.nome.length === 0)
      throw new InvalidArgumentError('É necessário preencher o campo nome!');

    if (this.email.length === 0)
      throw new InvalidArgumentError('É necessário preencher o campo email!');

    if (this.senha.length < 6)
      throw new InvalidArgumentError(
        'A senha precisa ter mais de 6 caracteres!'
      );
  }

  deleta() {
    return usuariosDao.deleta(this);
  }

  static buscaPorId(id) {
    return usuariosDao.buscaPorId(id);
  }

  static buscaPorEmail(email) {
    return usuariosDao.buscaPorEmail(email);
  }
}

module.exports = Usuario;
