const redis = require('redis');
const blacklist = redis.createClient({ prefix: 'blacklist:' });

const jwt = require('jsonwebtoken');
const { createHash } = require('crypto');

function geraTokenHash(token) {
  return createHash('sha256')
    .update(token)
    .digest('hex');
}

const lista = require('./manipula-lista')(blacklist);

module.exports = {
  async adiciona(token) {
    const dataExpiracao = jwt.decode(token).exp;
    const tokenHash = geraTokenHash(token);
    await lista.adiciona(tokenHash, '', dataExpiracao);
  },
  async contemToken(token) {
    const tokenHash = geraTokenHash(token);
    return lista.contemToken(tokenHash);
  }
};
