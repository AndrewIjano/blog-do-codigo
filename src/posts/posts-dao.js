const db = require('../../database');

class PostsDao {
  add(post) {
    return new Promise((resolve, reject) => {
      db.run(
        `
        INSERT INTO post (
          title, 
          content
        ) VALUES (?, ?)
      `,
        [post.title, post.content],
        err => {
          if (err) {
            console.error(err);
            return reject('Error while adding the post!');
          }

          resolve();
        }
      );
    });
  }

  all() {
    return new Promise((resolve, reject) => {
      db.all(`SELECT * FROM post`, (err, rows) => {
        if (err) {
          return reject('Error while getting the posts!');
        }

        return resolve(rows);
      });
    });
  }
}

module.exports = PostsDao;
