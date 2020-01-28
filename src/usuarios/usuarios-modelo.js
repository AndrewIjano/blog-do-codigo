const UsuariosDao = require('./usuarios-dao');
const InvalidArgumentError = require('../../erros').InvalidArgumentError;

class Usuario {
  constructor(usuario) {
    this.nome = usuario.nome;
    this.email = usuario.email;
    this.senha = usuario.senha;

    this.valida();
  }

  adiciona() {
    const usuariosDao = new UsuariosDao();
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
    const usuariosDao = new UsuariosDao();
    return usuariosDao.deleta(this);
  }

  static buscaPorId(id) {
    const usuariosDao = new UsuariosDao();
    return usuariosDao.buscaPorId(id);
  }

  static buscaPorEmail(email) {
    const usuariosDao = new UsuariosDao();
    return usuariosDao.buscaPorEmail(email);
  }
}

module.exports = Usuario;
