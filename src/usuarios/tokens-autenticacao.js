const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const moment = require('moment');

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
  const dataExpiracao = moment().add(5, 'd').unix();  
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

  async usaRefreshToken(refreshToken) {
    const usuarioId = await verificaRefreshToken(refreshToken);
    await refreshTokens.deleta(refreshToken);
    return usuarioId;
  },

  invalidaAccessToken(accessToken) {
    return blacklist.adiciona(accessToken);
  }
};
