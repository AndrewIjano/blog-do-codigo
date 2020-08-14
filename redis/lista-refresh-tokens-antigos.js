const redis = require('redis');
const manipulaLista = require('./manipula-lista');
const lista = redis.createClient({ prefix: 'lista-refresh-tokens-antigos:' });
module.exports = manipulaLista(lista);