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
    async deleta(chave) {
      // mesmo que não precise de um callback, ainda precisa tratar os erros
      // então a gente consegue capturar eles no try/catch usando await
      await delAsync(chave);
    }
  };
};
