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
  // iv: initialization vector
  const vetorInicializacao = crypto.randomBytes(16);
  const encriptador = crypto.createCipheriv(
    'aes-256-gcm',
    chave,
    vetorInicializacao
  );

  const payloadEncriptado = Buffer.concat([
    encriptador.update(payload, 'utf8'),
    encriptador.final()
  ]);

  const tag = encriptador.getAuthTag();

  // dá pra fazer sem .map() nem Buffer.concat() mas não fica tão simétrico com o decripta
  // e essa forma facilita pra adicionar elementos no refresh token
  const refreshToken = [payloadEncriptado, tag, vetorInicializacao]
    .map(item => item.toString('hex'))
    .join('.');

  return refreshToken;
}

function decripta(token, chave) {
  const tokenDividido = token.split('.').map(item => Buffer.from(item, 'hex'));
  // talvez instanciar Buffer em cada um primeiro e depois refatorar

  const [payloadEncriptado, tag, vetorInicializacao] = tokenDividido;

  const decriptador = crypto.createDecipheriv(
    'aes-256-gcm',
    chave,
    vetorInicializacao
  );
  decriptador.setAuthTag(tag);

  const payload =
    decriptador.update(payloadEncriptado, 'utf8') + decriptador.final('utf8');

  return payload;
}

function criaRefreshToken(usuario) {
  const payload = JSON.stringify({
    id: usuario.id,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 5
  });
  // console.log(require('crypto').randomBytes(22).toString('base64'))
  // string de 32 caracteres
  const chave = process.env.CHAVE_REFRESH_TOKEN;
  const refreshToken = encripta(payload, chave);
  return refreshToken;
}

function verificaRefreshToken(token) {
  if (!token) {
    throw new InvalidArgumentError('Refresh token inválido');
  }

  const chave = process.env.CHAVE_REFRESH_TOKEN;
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

  atualizaToken(req, res) {
    try {
      const refreshToken = req.body.refreshToken;
      const payload = verificaRefreshToken(refreshToken);

      // talvez dê pra refatorar isso?
      const accessToken = criaTokenJWT(payload);
      const novoRefreshToken = criaRefreshToken(payload);
      res.set('Authorization', accessToken);
      res.status(200).json({ refreshToken: novoRefreshToken });
    } catch (erro) {
      if (erro instanceof InvalidArgumentError) {
        res.status(401).json({ erro: erro.message });
      } else {
        res.status(500).json({ erro: erro.message });
      }
    }
  },

  login(req, res) {
    try {
      const accessToken = criaTokenJWT(req.user);
      const refreshToken = criaRefreshToken(req.user);
      res.set('Authorization', accessToken);
      res.status(200).json({ refreshToken });
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
