const db = require('../../database');
const { InternalServerError } = require('../erros');

const { promisify } = require('util');
const dbRun = promisify(db.run).bind(db);
const dbGet = promisify(db.get).bind(db);
const dbAll = promisify(db.all).bind(db);

module.exports = {
  adiciona: async usuario => {
    try {
      await dbRun(
        `INSERT INTO usuarios (nome, email, senhaHash) VALUES (?, ?, ?)`,
        [usuario.nome, usuario.email, usuario.senhaHash]
      );
    } catch (erro) {
      console.log(erro);
      throw new InternalServerError('Erro ao adicionar o usuário!');
    }
  },

  buscaPorId: async id => {
    try {
      return await dbGet(`SELECT * FROM usuarios WHERE id = ?`, [id]);
    } catch (erro) {
      throw new InternalServerError('Não foi possível encontrar o usuário!');
    }
  },

  buscaPorEmail: async email => {
    try {
      return await dbGet(`SELECT * FROM usuarios WHERE email = ?`, [email]);
    } catch (erro) {
      throw new InternalServerError('Não foi possível encontrar o usuário!');
    }
  },

  lista: async () => {
    try {
      return await dbAll(`SELECT * FROM usuarios`);
    } catch (erro) {
      throw new InternalServerError('Erro ao listar usuários!');
    }
  },

  deleta: async usuario => {
    try {
      await dbRun(`DELETE FROM usuarios WHERE id = ?`, [usuario.id]);
    } catch (erro) {
      throw new InternalServerError('Erro ao deletar o usuário');
    }
  }
};
