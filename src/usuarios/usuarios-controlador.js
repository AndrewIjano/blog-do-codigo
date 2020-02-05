const Usuario = require('./usuarios-modelo');
const { InvalidArgumentError, InternalServerError } = require('../../erros');
const jwt = require('jsonwebtoken');

function criaTokenJWT(usuario) {
  const payload = {
    id: usuario.id
  };

  return jwt.sign(payload, process.env.JWT_KEY + usuario.ultimoLogout, {
    expiresIn: '5d'
  });
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
    return res.status(200).send();
  },

  logout: (req, res) => {
    const usuario = req.user;
    usuario.atualizaLogout();

    res.status(200).send();
  },

  deleta: (req, res) => {
    if (!req.user || req.user.id != req.params.id) {
      return res
        .status(403)
        .send('Você precisa entrar como esse usuário para isso!');
    }

    const usuario = new Usuario(req.user);
    usuario
      .deleta()
      .then(() => {
        res.send('Usuário deletado com sucesso!');
      })
      .catch(erro => {
        res.status(500).json({ erro: erro });
      });
  }
};
