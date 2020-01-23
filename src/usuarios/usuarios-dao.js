const db = require('../../database');

class UsuariosDao {
  buscaPorId(id) {
    return new Promise((resolve, reject) => {
      db.get(
        `
        SELECT *
        FROM usuarios
        WHERE id = ?
      `,
        [id],
        (erro, usuario) => {
          if (erro) {
            console.error(erro);
            return reject('Não foi possível encontrar o usuário!');
          }

          return resolve(usuario);
        }
      );
    });
  }
  buscaPorEmail(email) {
    return new Promise((resolve, reject) => {
      db.get(
        `
        SELECT *
        FROM usuarios
        WHERE email = ?
      `,
        [email],
        (erro, usuario) => {
          if (erro) {
            console.error(erro);
            return reject('Não foi possível encontrar o usuário!');
          }

          return resolve(usuario);
        }
      );
    });
  }
}


module.exports = UsuariosDao;