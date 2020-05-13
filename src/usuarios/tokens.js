const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const moment = require('moment');

const refreshTokens = require('../../redis/refresh-tokens');
const blacklist = require('../../redis/blacklist');
const tokensAtualizaSenha = require('../../redis/tokens-atualiza-senha');

const { InvalidArgumentError } = require('../erros');

function criaAccessToken(usuarioId) {
  const payload = { id: usuarioId };
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

async function criaTokenAtualizaSenha(usuarioId) {
  const tokenAtualizaSenha = crypto.randomBytes(24).toString('hex');
  const dataExpiracao = moment()
    .add(1, 'h')
    .unix();
  await tokensAtualizaSenha.adiciona(
    tokenAtualizaSenha,
    usuarioId,
    dataExpiracao
  );

  return tokenAtualizaSenha;
}

function verificaTokenExiste(token, nomeToken) {
  if (!token) {
    throw new InvalidArgumentError(`${nomeToken} não enviado`);
  }
}

function verificaTokenValido(usuarioId, nomeToken) {
  if (!usuarioId) {
    throw new InvalidArgumentError(`${nomeToken} inválido`);
  }
}

module.exports = {
  async criaTokensAutenticacao(usuarioId) {
    const accessToken = criaAccessToken(usuarioId);
    const refreshToken = await criaRefreshToken(usuarioId);
    return { accessToken, refreshToken };
  },

  criaTokenVerificaEmail(usuarioId) {
    const payload = { id: usuarioId };
    return jwt.sign(payload, process.env.CHAVE_JWT, { expiresIn: '1h' });
  },

  criaTokenAtualizaSenha,

  async verificaRefreshToken(token) {
    const nomeRefreshToken = 'Refresh Token';
    verificaTokenExiste(token, nomeRefreshToken);
    const id = await refreshTokens.buscaId(token);
    verificaTokenValido(id, nomeRefreshToken);
    return id;
  },

  verificaTokenVerificaEmail(token) {
    const nomeTokenVerificaEmail = 'Token para verificação de e-mail';
    verificaTokenExiste(token, nomeTokenVerificaEmail);
    const { id } = jwt.verify(token, process.env.CHAVE_JWT);
    return id;
  },

  async verificaTokenAtualizaSenha(token) {
    const nomeTokenAtualizaSenha = 'Token para atualização de senha';
    verificaTokenExiste(token, nomeTokenAtualizaSenha);
    const id = await tokensAtualizaSenha.buscaId(token);
    verificaTokenValido(id, nomeTokenAtualizaSenha);
    return id;
  },

  invalidaAccessToken(token) {
    return blacklist.adiciona(token);
  },

  invalidaRefreshToken(token) {
    return refreshTokens.deleta(token);
  },

  invalidaTokenAtualizaSenha(token) {
    return tokensAtualizaSenha.deleta(token);
  }
};
