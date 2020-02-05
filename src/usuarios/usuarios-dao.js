const db = require('../../database');
const { InvalidArgumentError, InternalServerError } = require('../../erros');

module.exports = {
  adiciona: usuario => {
    return new Promise((resolve, reject) => {
      db.run(
        `
          INSERT INTO usuarios (
            nome,
            email,
            senhaHash,
            ultimoLogout
          ) VALUES (?, ?, ?, ?)
        `,
        [usuario.nome, usuario.email, usuario.senhaHash, usuario.ultimoLogout],
        err => {
          if (err) {
            reject(new InternalServerError('Erro ao adicionar o usuário!'));
          }

          return resolve();
        }
      );
    });
  },

  buscaPorId: id => {
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
            return reject('Não foi possível encontrar o usuário!');
          }

          return resolve(usuario);
        }
      );
    });
  },

  buscaPorEmail: email => {
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
            return reject('Não foi possível encontrar o usuário!');
          }

          return resolve(usuario);
        }
      );
    });
  },

  buscaUltimoLogout: id => {
    return new Promise((resolve, reject) => {
      db.get(
        `
          SELECT ultimoLogout
          FROM usuarios
          WHERE id = ?
        `,
        [id],
        (erro, resultado) => {
          if (erro) {
            return reject('Não foi possível encontrar o usuário!');
          }

          return resolve(resultado.ultimoLogout);
        }
      );
    });
  },

  atualizaLogout: (usuario) => {
    return new Promise((resolve, reject) => {
      db.run(
      `
        UPDATE usuarios
        SET ultimoLogout = ?
        WHERE id = ?
      `,
      [usuario.ultimoLogout, usuario.id],
      erro => {
        if (erro) {
          return reject('Não foi possível atualizar o último logout');
        }
        return resolve();
      })
    })
  },

  deleta: usuario => {
    return new Promise((resolve, reject) => {
      db.run(
        `
          DELETE FROM usuarios
          WHERE email = ?
        `,
        [usuario.email],
        err => {
          if (err) {
            return reject('Erro ao deletar o usuário');
          }
          return resolve();
        }
      );
    });
  }
};
