const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db.sqlite');

const POSTS_SCHEMA = `
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo VARCHAR(50) NOT NULL,
    conteudo VARCHAR(140)
  )
  `;

const USUARIOS_SCHEMA = `
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(40) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL
  )
  `;

const COMENTARIOS_SCHEMA = `
    CREATE TABLE IF NOT EXISTS comentarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER REFERENCES post(id),
      usuario_id INTEGER REFERENCES usuario(id),
      conteudo VARCHAR(140)
    )
  `;

const INSERT_USUARIO_1 = `
    INSERT OR IGNORE INTO usuarios (nome, email, senha)
    VALUES( 'Andrew', 'a@a.a', '123123') 
`;

const INSERT_POST_1 = `
    INSERT INTO posts (titulo, conteudo)
    SELECT  'Primeiro post', 'Esse é o meu primeiro post :)'
    WHERE NOT EXISTS (
      SELECT * FROM posts 
      WHERE titulo = 'Primeiro post'
      ) 
`;

db.serialize(() => {
  db.run('PRAGMA foreign_keys=ON');
  db.run(POSTS_SCHEMA);
  db.run(USUARIOS_SCHEMA);
  db.run(COMENTARIOS_SCHEMA);
  db.run(INSERT_USUARIO_1);
  db.run(INSERT_POST_1);

  db.each('SELECT * FROM usuarios', (err, usuario) => {
    console.log('Usuario: ');
    console.log(usuario);
  });
});

process.on('SIGINT', () =>
  db.close(() => {
    process.exit(0);
  })
);

module.exports = db;
