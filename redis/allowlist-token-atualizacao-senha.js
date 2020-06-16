const redis = require('redis');
const manipulaLista = require('./manipula-lista');
const allowlist = redis.createClient({
  prefix: 'allowlist-token-atualizacao-senha:',
});
module.exports = manipulaLista(allowlist);
