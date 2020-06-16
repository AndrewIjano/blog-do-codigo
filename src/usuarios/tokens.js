const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const moment = require('moment');

const {
  allowlistRefreshToken,
  allowlistTokenAtualizacaoSenha,
  blocklistAccessToken,
} = require('../../redis');

const { InvalidArgumentError } = require('../erros');

function criaTokenJWT(id, [tempoQuantidade, tempoUnidade]) {
  return jwt.sign({ id }, process.env.CHAVE_JWT, {
    expiresIn: tempoQuantidade + tempoUnidade,
  });
}

async function verificaTokenJWT(token, nome, blocklist) {
  await verificaTokenNaBlocklist(token, nome, blocklist);
  const { id } = jwt.verify(token, process.env.CHAVE_JWT);
  return id;
}

async function verificaTokenNaBlocklist(token, nome, blocklist) {
  if (!blocklist) {
    return;
  }

  const tokenNaBlocklist = await blocklist.contemToken(token);
  if (tokenNaBlocklist) {
    throw new jwt.JsonWebTokenError(`${nome} inválido por logout!`);
  }
}

async function criaTokenOpaco(id, [tempoQuantidade, tempoUnidade], allowlist) {
  const tokenOpaco = crypto.randomBytes(24).toString('hex');
  const dataExpiracao = moment().add(tempoQuantidade, tempoUnidade).unix();
  await allowlist.adiciona(tokenOpaco, id, dataExpiracao);
  return tokenOpaco;
}

async function verificaTokenOpaco(token, nome, allowlist) {
  verificaTokenEnviado(token, nome);
  const id = await allowlist.buscaValor(token);
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
    lista: blocklistAccessToken,
    cria(id) {
      return criaTokenJWT(id, this.expiracao);
    },
    verifica(token) {
      return verificaTokenJWT(token, this.nome, this.lista);
    },
    invalida(token) {
      return this.lista.adiciona(token);
    },
  },
  refresh: {
    nome: 'refresh token',
    expiracao: [5, 'd'],
    lista: allowlistRefreshToken,
    cria(id) {
      return criaTokenOpaco(id, this.expiracao, this.lista);
    },
    verifica(token) {
      return verificaTokenOpaco(token, this.nome, this.lista);
    },
    invalida(token) {
      return this.lista.deleta(token);
    },
  },
  verificacaoEmail: {
    nome: 'token de verificação de e-mail',
    expiracao: [1, 'h'],
    cria(id) {
      return criaTokenJWT(id, this.expiracao);
    },
    verifica(token) {
      return verificaTokenJWT(token, this.nome);
    },
  },
  atualizacaoSenha: {
    nome: 'token de atualização de senha',
    expiracao: [1, 'h'],
    lista: allowlistTokenAtualizacaoSenha,
    cria(id) {
      return criaTokenOpaco(id, this.expiracao, this.lista);
    },
    verifica(token) {
      return verificaTokenOpaco(token, this.nome, this.lista);
    },
    invalida(token) {
      return this.lista.deleta(token);
    },
  },
};
