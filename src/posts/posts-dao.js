const db = require('../../database');

class PostsDao {
  adiciona(post) {
    return new Promise((resolve, reject) => {
      db.run(
        `
        INSERT INTO post (
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

          resolve();
        }
      );
    });
  }

  lista() {
    return new Promise((resolve, reject) => {
      db.all(`SELECT * FROM post`, (err, resultados) => {
        if (err) {
          return reject('Erro ao listar os posts!');
        }

        return resolve(resultados);
      });
    });
  }
}

module.exports = PostsDao;
