const db = require('../../database');

module.exports = {
  adiciona: post => {
    return new Promise((resolve, reject) => {
      db.run(
        `
        INSERT INTO posts (
          titulo, 
          conteudo
        ) VALUES (?, ?)
      `,
        [post.titulo, post.conteudo],
        err => {
          if (err) {
            console.error(err);
            return reject('Erro ao adicionar o post!');
          }

          return resolve();
        }
      );
    });
  },

  lista: () => {
    return new Promise((resolve, reject) => {
      db.all(`SELECT * FROM posts`, (err, resultados) => {
        if (err) {
          console.error(err);
          return reject('Erro ao listar os posts!');
        }

        return resolve(resultados);
      });
    });
  }
};
