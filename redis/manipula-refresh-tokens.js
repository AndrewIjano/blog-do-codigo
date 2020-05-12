const refreshTokens = require('./refresh-tokens');

const { promisify } = require('util');
const setAsync = promisify(refreshTokens.set).bind(refreshTokens);
const getAsync = promisify(refreshTokens.get).bind(refreshTokens);
const delAsync = promisify(refreshTokens.del).bind(refreshTokens);


module.exports = {
  async adiciona(token, id, dataExpiracao) {
    await setAsync(token, id);
    refreshTokens.expireat(token, dataExpiracao);
  },
  buscaId(token) {
    return getAsync(token);
  },
  deleta(token) {
    // uso await e async aqui?
    delAsync(token);
  }
};
