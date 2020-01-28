const db = require('../../database');

class UsuariosDao {
  adiciona(usuario) {
    return new Promise((resolve, reject) => {
      db.run(
        `
        INSERT INTO usuarios (
          nome,
          email,
          senha
        ) VALUES (?, ?, ?)
      `,
        [usuario.nome, usuario.email, usuario.senha],
        err => {
          if (err) {
            reject('Erro ao adicionar o usuário!');
          }

          return resolve();
        }
      );
    });
  }

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

  deleta(usuario) {
    return new Promise((resolve, reject) => {
      db.run(
        `
        DELETE FROM usuarios
        WHERE email = ?
      `,
        [usuario.email],
        err => {
          if (err) {
            console.error(err);
            return reject('Erro ao deletar o usuário');
          }
          return resolve();
        }
      );
    });
  }
}

module.exports = UsuariosDao;
