const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const moment = require('moment');

const whitelistRefreshToken = require('../../redis/whitelist-refresh-token');
const blacklistAccessToken = require('../../redis/blacklist-access-token');

const { InvalidArgumentError } = require('../erros');

function criaTokenJWT(id, [tempoQuantidade, tempoUnidade]) {
  return jwt.sign({ id }, process.env.CHAVE_JWT, {
    expiresIn: tempoQuantidade + tempoUnidade
  });
}

async function verificaTokenJWT(token, nome, blacklist) {
  await verificaTokenNaBlacklist(token, nome, blacklist);
  const { id } = jwt.verify(token, process.env.CHAVE_JWT);
  return id;
}

async function verificaTokenNaBlacklist(token, nome, blacklist) {
  const tokenNaBlacklist = await blacklist.contemToken(token);
  if (tokenNaBlacklist) {
    throw new jwt.JsonWebTokenError(`${nome} inválido por logout!`);
  }
}

async function criaTokenOpaco(id, [tempoQuantidade, tempoUnidade], whitelist) {
  const tokenOpaco = crypto.randomBytes(24).toString('hex');
  const dataExpiracao = moment()
    .add(tempoQuantidade, tempoUnidade)
    .unix();
  await whitelist.adiciona(tokenOpaco, id, dataExpiracao);
  return tokenOpaco;
}

async function verificaTokenOpaco(token, nome, whitelist) {
  verificaTokenEnviado(token, nome);
  const id = await whitelist.buscaValor(token);
  verificaTokenValido(id, nome);
  return id;
}

function verificaTokenEnviado(token, nome) {
  if (!token) {
    throw new InvalidArgumentError(`${nome} não enviado!`);
  }
}

function verificaTokenValido(id, nome) {
  if (!id) {
    throw new InvalidArgumentError(`${nome} inválido!`);
  }
}

module.exports = {
  access: {
    nome: 'access token',
    expiracao: [15, 'm'],
    lista: blacklistAccessToken,
    cria(id) {
      return criaTokenJWT(id, this.expiracao);
    },
    verifica(token) {
      return verificaTokenJWT(token, this.nome, this.lista);
    },
    invalida(token) {
      return this.lista.adiciona(token);
    }
  },
  refresh: {
    nome: 'refresh token',
    expiracao: [5, 'd'],
    lista: whitelistRefreshToken,
    cria(id) {
      return criaTokenOpaco(id, this.expiracao, this.lista);
    },
    verifica(token) {
      return verificaTokenOpaco(token, this.nome, this.lista);
    },
    invalida(token) {
      return this.lista.deleta(token);
    }
  }
};
