const blacklist = require('./blacklist');

const { promisify } = require('util');
const getAsync = promisify(blacklist.get).bind(blacklist);
const keysAsync = promisify(blacklist.keys).bind(blacklist);
const delAsync = promisify(blacklist.del).bind(blacklist);

const { createHash } = require('crypto');

const jwt = require('jsonwebtoken');

function geraTokenHash(token) {
  return createHash('sha256')
    .update(token)
    .digest('hex');
}

module.exports = {
  adicionaToken: token => {
    const tokenHash = geraTokenHash(token);
    const dataExpiracao = jwt.decode(token).exp;
    blacklist.set(tokenHash, dataExpiracao.toString());
  },

  contemToken: async token => {
    const tokenHash = geraTokenHash(token);
    const resultado = await getAsync(tokenHash);
    return resultado !== null;
  },

  listaChaves: async () => {
    const chaves = await keysAsync('*');
    return chaves;
  },

  buscaDataExpiracao: async chave => {
    const dataExpiracao = await getAsync(chave);
    return parseInt(dataExpiracao);
  },

  deletaToken: chave => {
    delAsync(chave);
  }
};
