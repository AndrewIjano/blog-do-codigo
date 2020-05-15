const redis = require('redis');
const manipulaLista = require('./manipula-lista');
const whitelist = redis.createClient({
  prefix: 'whitelist-token-atualizacao-senha:'
});
module.exports = manipulaLista(whitelist);
