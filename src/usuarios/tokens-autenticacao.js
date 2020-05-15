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
async function criaRefreshToken(usuarioId) {
  const refreshToken = crypto.randomBytes(24).toString('hex');
  const dataExpiracao = moment()
    .add(5, 'd')
    .unix();
  await refreshTokens.adiciona(refreshToken, usuarioId, dataExpiracao);

  return refreshToken;
}

function verificaRefreshTokenExiste(token) {
  if (!token) {
    throw new InvalidArgumentError('Refresh token não enviado');
  }
}

function verificaRefreshTokenValido(usuarioId) {
  if (!usuarioId) {
    throw new InvalidArgumentError('Refresh token inválido');
  }
}

module.exports = {
  async criaTokens(usuarioId) {
    const accessToken = criaAccessToken(usuarioId);
    const refreshToken = await criaRefreshToken(usuarioId);
    return { accessToken, refreshToken };
  },

  async verificaRefreshToken(token) {
    verificaRefreshTokenExiste(token);
    const id = await refreshTokens.buscaId(token);
    verificaRefreshTokenValido(id);
    return id;
  },

  invalidaRefreshToken(refreshToken) {
    return refreshTokens.deleta(refreshToken);
  },

  invalidaAccessToken(accessToken) {
    return blacklist.adiciona(accessToken);
  }
};
