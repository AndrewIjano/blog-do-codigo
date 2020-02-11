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
  adicionaToken: (token, dataExp) => {
    const tokenHash = geraTokenHash(token);
    blacklist.set(tokenHash, dataExp.toString());
  },

  buscaToken: token => {
    return getAsync(geraTokenHash(token));
  }
};
