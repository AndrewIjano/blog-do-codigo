const redis = require('redis');
const manipulaLista = require('./manipula-lista'); 
const refreshTokens = redis.createClient({ prefix: 'refresh-token:' });
module.exports = manipulaLista(refreshTokens);

