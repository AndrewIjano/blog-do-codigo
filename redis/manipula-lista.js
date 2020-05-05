const { promisify } = require('util');

module.exports = lista => {
  const setAsync = promisify(lista.set).bind(lista);
  const getAsync = promisify(lista.get).bind(lista);
  const delAsync = promisify(lista.del).bind(lista);
  const existsAsync = promisify(lista.exists).bind(lista);

  return {
    async adiciona(chave, valor, dataExpiracao) {
      await setAsync(chave, valor);
      lista.expireat(chave, dataExpiracao);
    },
    buscaId(chave) {
      return getAsync(chave);
    },
    async contemChave(chave) {
      const resultado = await existsAsync(chave);
      return resultado === 1;
    },
    deleta(chave) {
      // uso await e async aqui?
      delAsync(chave);
    }
  };  
} 