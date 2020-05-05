const redis = require('redis');
const manipulaLista = require('./manipula-lista'); 
const tokensAtualizaSenha = redis.createClient({
  prefix: 'tokens-atualiza-senha:'
});

module.exports = manipulaLista(tokensAtualizaSenha);
