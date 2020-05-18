const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const moment = require('moment');
const speakeasy = require('speakeasy');

const {
  blacklistAccessToken,
  whitelistTokenAtualizacaoSenha,
  whitelistRefreshToken
} = require('../../redis');

const { InvalidArgumentError } = require('../erros');

function criaTokenJWT(id, [tempoQuantidade, tempoUnidade]) {
  return jwt.sign({ id }, process.env.CHAVE_JWT, {
    expiresIn: tempoQuantidade + tempoUnidade
  });
}

async function verificaTokenJWT(token, nomeToken, blacklist) {
  verificaTokenEnviado(token, nomeToken);
  await verificaTokenNaBlacklist(token, blacklist);
  const { id } = jwt.verify(token, process.env.CHAVE_JWT);
  return id;
}

async function criaTokenOpaco(id, [tempoQuantidade, tempoUnidade], lista) {
  const tokenOpaco = crypto.randomBytes(24).toString('hex');
  const dataExpiracao = moment()
    .add(tempoQuantidade, tempoUnidade)
    .unix();
  await lista.adiciona(tokenOpaco, id, dataExpiracao);
  return tokenOpaco;
}

async function verificaTokenOpaco(token, nomeToken, lista) {
  verificaTokenEnviado(token, nomeToken);
  const id = await lista.buscaId(token);
  verificaTokenValido(id, nomeToken);
  return id;
}

function verificaTokenEnviado(token, nomeToken) {
  if (!token) {
    throw new InvalidArgumentError(`Token ${nomeToken} não enviado`);
  }
}

function verificaTokenValido(usuarioId, nomeToken) {
  if (!usuarioId) {
    throw new InvalidArgumentError(`Token ${nomeToken} inválido`);
  }
}

async function verificaTokenNaBlacklist(token, blacklist) {
  if (!blacklist) {
    return;
  }

  const tokenNaBlacklist = await blacklist.contemToken(token);
  if (tokenNaBlacklist) {
    throw new jwt.JsonWebTokenError('Token inválido por logout!');
  }
}

module.exports = {
  access: {
    nome: 'access',
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
    nome: 'refresh',
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
  },

  verificacaoEmail: {
    nome: 'verificacaoEmail',
    expiracao: [1, 'h'],
    cria(id) {
      return criaTokenJWT(id, this.expiracao);
    },
    verifica(token) {
      return verificaTokenJWT(token, this.nome);
    }
  },

  atualizacaoSenha: {
    nome: 'atualizacaoSenha',
    expiracao: [1, 'h'],
    lista: whitelistTokenAtualizacaoSenha,
    cria(id) {
      return criaTokenOpaco(id, this.expiracao, this.lista);
    },
    verifica(token) {
      return verificaTokenOpaco(token, this.nome, this.lista);
    },
    invalida(token) {
      return this.lista.deleta(token);
    }
  },

  totp: {
    nome: 'TOTP',
    cria() {
      return speakeasy.generateSecret().base32;
    },
    verifica(token, chave) {
      verificaTokenEnviado(token, this.nome);
      const tokenValido = speakeasy.totp.verify({
        secret: chave,
        encoding: 'base32',
        token: token
      });
      verificaTokenValido(tokenValido, this.nome);
    }
  },

  segundaEtapa: {
    nome: 'segundaEtapa',
    expiracao: [5, 'm'],
    cria(id) {
      return criaTokenJWT(id, this.expiracao);
    },
    verifica(token) {
      return verificaTokenJWT(token, this.nome);
    }
  }
};
