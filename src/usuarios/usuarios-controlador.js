const Usuario = require('./usuarios-modelo');
const { InvalidArgumentError, InternalServerError } = require('../../erros');
const jwt = require('jsonwebtoken');
const blacklist = require('../blacklist/manipula-blacklist');

function criaTokenJWT(usuario) {
  const payload = {
    id: usuario.id
  };

  return jwt.sign(payload, process.env.JWT_KEY, {
    expiresIn: '5d'
  });
}

function adicionaTokenBlacklist(token) {
  const dataExp = jwt.decode(token, process.env.JWT_KEY).exp;
  blacklist.adicionaToken(token, dataExp);
}

module.exports = {
  registra: async (req, res) => {
    const { nome, email, senha } = req.body;

    try {
      const usuario = new Usuario({ nome, email });
      await usuario.adicionaSenha(senha);
      await usuario.adiciona();

      res.status(201).json(usuario);
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

  login: (req, res) => {
    const token = criaTokenJWT(req.user);
    res.set('Authorization', token);
    res.status(204).send();
  },

  logout: (req, res) => {
    try {
      const token = req.headers.authorization.split(' ')[1];
      adicionaTokenBlacklist(token);
      res.status(205).send();
    } catch (erro) {
      res.status(500).json({ erro: erro.message });
    }
  },

  deleta: async (req, res) => {
    if (req.user.id != req.params.id) {
      return res
        .status(403)
        .send('Você precisa entrar como esse usuário para isso!');
    }

    const usuario = req.user;
    try {
      await usuario.deleta();
      res.status(200).send();
    } catch (erro) {
      res.status(500).json({ erro: erro });
    }
  }
};
