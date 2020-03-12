const blacklist = require('./blacklist');

const { promisify } = require('util');
const getAsync = promisify(blacklist.get).bind(blacklist);

const { createHash } = require('crypto');

function geraTokenHash(token) {
  return createHash('sha256')
    .update(token)
    .digest('hex');
}

module.exports = {
  adicionaToken: token => {
    const tokenHash = geraTokenHash(token);
    blacklist.set(tokenHash, '');
  },
  contemToken: async token => {
    const tokenHash = geraTokenHash(token);
    const resultado = await getAsync(tokenHash);
    return resultado !== null;
  }
};
