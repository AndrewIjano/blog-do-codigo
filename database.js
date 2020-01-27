const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db.sqlite');

const POST_SCHEMA = `
  CREATE TABLE IF NOT EXISTS post (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo VARCHAR(50) NOT NULL,
    conteudo VARCHAR(140)
  )
  `;

const USUARIO_SCHEMA = `
  CREATE TABLE IF NOT EXISTS usuario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(40) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL
  )
  `;

const COMMENT_SCHEMA = `
    CREATE TABLE IF NOT EXISTS comentario (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER REFERENCES post(id),
      usuario_id INTEGER REFERENCES usuario(id),
      conteudo VARCHAR(140)
    )
  `;

const INSERT_USUARIO_1 = `
    INSERT OR IGNORE INTO usuario (nome, email, senha)
    VALUES( 'Andrew', 'a@a.a', '123') 
`;

const INSERT_POST_1 = `
    INSERT INTO post (titulo, conteudo)
    SELECT  'Primeiro post', 'Esse é o meu primeiro post :)'
    WHERE NOT EXISTS (
      SELECT * FROM post 
      WHERE titulo = 'Primeiro post'
      ) 
`;

db.serialize(() => {
  db.run('PRAGMA foreign_keys=ON');
  db.run(POST_SCHEMA);
  db.run(USUARIO_SCHEMA);
  db.run(COMMENT_SCHEMA);
  db.run(INSERT_USUARIO_1);
  db.run(INSERT_POST_1);

  db.each('SELECT * FROM usuario', (err, usuario) => {
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
