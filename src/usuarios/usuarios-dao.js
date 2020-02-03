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
            senhaHash
          ) VALUES (?, ?, ?)
        `,
        [usuario.nome, usuario.email, usuario.senhaHash],
        err => {
          if (err) {
            if (err.errno === 19) {
              reject(new InvalidArgumentError('Erro ao adicionar o usuário!'));
            } else {
              reject(new InternalServerError('Erro ao adicionar o usuário!'));
            }
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
            console.error(erro);
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
            console.error(erro);
            return reject('Não foi possível encontrar o usuário!');
          }

          return resolve(usuario);
        }
      );
    });
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
            console.error(err);
            return reject('Erro ao deletar o usuário');
          }
          return resolve();
        }
      );
    });
  }
};
