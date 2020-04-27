const Usuario = require('./usuarios-modelo');
const { InvalidArgumentError, InternalServerError } = require('../erros');

const jwt = require('jsonwebtoken');
const blacklist = require('../../redis/manipula-blacklist');
const crypto = require('crypto');

function criaTokenJWT(usuario) {
  const payload = {
    id: usuario.id
  };

  const token = jwt.sign(payload, process.env.CHAVE_JWT, { expiresIn: '15m' });
  return token;
}

function encripta(payload, chave) {
  chave = crypto.scryptSync(chave, 'salt', 32);
  console.log(chave);
  // iv: initialization vector
  const vetorInicializacao = crypto.randomBytes(16);
  const encriptador = crypto.createCipheriv(
    'aes-256-gcm',
    chave,
    vetorInicializacao
  );
  const payloadEncriptado =
    encriptador.update(payload, 'utf8') + encriptador.final();
  const tag = encriptador.getAuthTag();
  const refreshToken = JSON.stringify({
    payloadEncriptado,
    tag,
    vetorInicializacao
  });
  return Buffer.from(refreshToken).toString('base64');
}

function decripta(token, chave) {
  chave = crypto.scryptSync(chave, 'salt', 32);
  console.log(chave);
  const { payloadEncriptado, tag, vetorInicializacao } = JSON.parse(
    Buffer.from(token, 'base64')
  );
  const decriptador = crypto.createDecipheriv(
    'aes-256-gcm',
    chave,
    Buffer.from(vetorInicializacao)
  );
  decriptador.setAuthTag(Buffer.from(tag));

  const payload = decriptador.update(payloadEncriptado) + decriptador.final();

  return payload;
}

function criaRefreshToken(usuario) {
  const chave = 'senha-secreta';
  const nonce = 'aaaaa';
  const payload = JSON.stringify({
    id: usuario.id,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 5,
    nonce
  });

  const refreshToken = encripta(payload, chave);
  return refreshToken;
}

function verificaRefreshToken(token) {
  const chave = 'senha-secreta';
  const payload = decripta(token, chave);
  return payload;
}

module.exports = {
  async adiciona(req, res) {
    const { nome, email, senha } = req.body;

    try {
      const usuario = new Usuario({
        nome,
        email
      });

      await usuario.adicionaSenha(senha);

      await usuario.adiciona();

      res.status(201).json();
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

  async login(req, res) {
    try {
      const accessToken = criaTokenJWT(req.user);
      const refreshToken = criaRefreshToken(req.user);
      res.set('Authorization', accessToken);
      res.status(200).json({ refreshToken: refreshToken });
    } catch (erro) {
      res.status(500).json({ erro: erro.message });
    }
  },

  async logout(req, res) {
    try {
      const token = req.token;
      await blacklist.adiciona(token);
      res.status(204).json();
    } catch (erro) {
      res.status(500).json({ erro: erro.message });
    }
  },

  async lista(req, res) {
    try {
      const usuarios = await Usuario.lista();
      res.json(usuarios);
    } catch (erro) {
      res.status(500).json({ erro: erro.message });
    }
  },

  async deleta(req, res) {
    try {
      const usuario = await Usuario.buscaPorId(req.params.id);
      await usuario.deleta();
      res.status(200).json();
    } catch (erro) {
      res.status(500).json({ erro: erro });
    }
  }
};
