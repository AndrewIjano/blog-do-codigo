const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const refreshTokens = require('../../redis/manipula-refresh-tokens');
const blacklist = require('../../redis/manipula-blacklist');

const { InvalidArgumentError } = require('../erros');

function criaAccessToken(usuarioId) {
  const payload = {
    id: usuarioId
  };

  const token = jwt.sign(payload, process.env.CHAVE_JWT, { expiresIn: '15m' });
  return token;
}

// É possível criar mecanismos para detectar roubo de refresh token
function criaRefreshToken(usuarioId) {
  const refreshToken = crypto.randomBytes(24).toString('hex');

  const cincoDiasEmMilissegundos = 1000 * 60 * 60 * 24 * 5;
  const dataExpiracao = Date.now() + cincoDiasEmMilissegundos;
  refreshTokens.adiciona(refreshToken, usuarioId, dataExpiracao);

  return refreshToken;
}

async function verificaRefreshToken(token) {
  if (!token) {
    throw new InvalidArgumentError('Refresh token inválido');
  }

  const id = await refreshTokens.buscaId(token);

  // Essas verificações repetidas estão certas?
  if (!id) {
    throw new InvalidArgumentError('Refresh token inválido');
  }
  return id;
}

module.exports = {
  criaTokens(usuarioId) {
    const accessToken = criaAccessToken(usuarioId);
    const refreshToken = criaRefreshToken(usuarioId);
    return { accessToken, refreshToken };
  },

  async atualizaTokens(refreshToken) {
    const usuarioId = await verificaRefreshToken(refreshToken);
    await refreshTokens.deleta(refreshToken);
    return this.criaTokens(usuarioId);
  },

  invalidaAccessToken(accessToken) {
    return blacklist.adiciona(accessToken);
  }
};
