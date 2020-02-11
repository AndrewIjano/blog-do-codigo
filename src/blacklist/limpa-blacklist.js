const blacklist = require('../../redis');

const { promisify } = require('util');
const scanAsync = promisify(blacklist.scan).bind(blacklist);
const delAsync = promisify(blacklist.del).bind(blacklist);

function scanChaves(cursor, chaves) {
  return scanAsync(cursor).then(res => {
    cursor = res[0];

    res[1].forEach(chave => {
      chaves.push(chave);
    });

    if (cursor === '0') {
      return chaves;
    }

    return scanChaves(cursor, chaves);
  });
}

async function limpaBlacklist() {
  const chaves = await scanChaves('0', []);
  chaves.forEach(async chave => {
    const dataExp = parseInt(await getAsync(chave));
    if (dataExp < Date.now() / 1000) {
      await delAsync(chave);
    }
  });
}

setInterval(limpaBlacklist, 3600 * 24 * 1000);
