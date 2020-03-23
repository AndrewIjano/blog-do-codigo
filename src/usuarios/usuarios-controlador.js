const Usuario = require('./usuarios-modelo');
const { InvalidArgumentError, InternalServerError } = require('../erros');
const jwt = require('jsonwebtoken');
const blacklist = require('../../redis/manipula-blacklist');

function criaTokenJWT(usuario) {
  const payload = {
    id: usuario.id
  };

  return jwt.sign(payload, process.env.CHAVE_JWT, {
    expiresIn: '15m'
  });
}

function buscaTokenNosHeaders(headers) {
  return headers.authorization.split(' ')[1];
}

function adicionaTokenBlacklist(token) {
  blacklist.adicionaToken(token);
}

module.exports = {
  adiciona: async (req, res) => {
    const { nome, email, senha } = req.body;

    try {
      const usuario = new Usuario({
        nome,
        email
      });

      await usuario.adicionaSenha(senha);
      usuario.adicionaChaveAutenticacaoDoisFatores();
      await usuario.adiciona();

      res.status(201).json({ chaveTOTP: usuario.chaveAutenticacaoDoisFatores });
    } catch (erro) {
      if (erro instanceof InvalidArgumentError) {
        res.status(422).json({ erro: erro.message });
      } else if (erro instanceof InternalServerError) {
        res.status(500).json({ erro: erro.message });
      } else {
        res.status(500).json({ erro: erro.message });
      }
    }
  },

  lista: async (req, res) => {
    const usuarios = await Usuario.lista();
    res.json(usuarios);
  },

  login: (req, res) => {
    const endereco = '/usuario/login/' + req.user.id;

    res.status(307).json({ endereco: endereco });
  },

  segundaEtapaAutenticacao: (req, res) => {
    const token = criaTokenJWT(req.user);
    res.set('Authorization', token);
    res.status(204).send();
  },

  logout: (req, res) => {
    try {
      const token = buscaTokenNosHeaders(req.headers);
      adicionaTokenBlacklist(token);
      res.status(204).send();
    } catch (erro) {
      res.status(500).json({ erro: erro.message });
    }
  },

  deleta: async (req, res) => {
    const usuario = await Usuario.buscaPorId(req.params.id);
    try {
      await usuario.deleta();
      res.status(200).send();
    } catch (erro) {
      res.status(500).json({ erro: erro });
    }
  }
};
