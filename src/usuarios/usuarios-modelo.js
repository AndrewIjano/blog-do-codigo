const usuariosDao = require('./usuarios-dao');
const { InvalidArgumentError } = require('../../erros');
const bcrypt = require('bcrypt');

class Usuario {
  constructor(usuario) {
    this.nome = usuario.nome;
    this.email = usuario.email;

    this.valida();
  }

  adicionaSenha(senha) {
    if (typeof senha !== 'string' || senha.length < 6)
      throw new InvalidArgumentError(
        'A senha precisa ter mais de 6 caracteres!'
      );

    const custoHash = 12;
    return bcrypt.hash(senha, custoHash).then(senhaHash => {
      this.senhaHash = senhaHash;
    });
  }

  adiciona() {
    return usuariosDao.adiciona(this);
  }

  valida() {
    this.campoStringNaoNulo(this.nome, 'nome');
    this.campoStringNaoNulo(this.email, 'email');
  }

  campoStringNaoNulo(valor, nome) {
    if (typeof valor !== 'string' || valor === 0)
      throw new InvalidArgumentError(`É necessário preencher o campo ${nome}!`);
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
