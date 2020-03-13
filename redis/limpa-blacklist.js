const blacklist = require('./manipula-blacklist');

async function limpaBlacklist() {
  const chaves = await blacklist.listaChaves();
  chaves.forEach(async chave => {
    const dataExpiracao = await blacklist.buscaDataExpiracao(chave);
    if (dataExpiracao < Date.now() / 1000) {
      blacklist.deletaToken(chave);
    }
  });
}

setInterval(limpaBlacklist, 1000 * 60 * 15);

