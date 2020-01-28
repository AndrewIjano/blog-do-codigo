const UsuariosDao = require('./usuarios-dao');

class Usuario {
  constructor(usuario) {
    this.nome = usuario.nome;
    this.email = usuario.email;
    this.senha = usuario.senha;
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
