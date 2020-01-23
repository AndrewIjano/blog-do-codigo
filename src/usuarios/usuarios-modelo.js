const UsuariosDao = require('./usuarios-dao');

class Usuario {
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
