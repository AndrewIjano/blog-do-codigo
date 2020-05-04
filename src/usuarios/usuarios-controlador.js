const Usuario = require('./usuarios-modelo');
const { InvalidArgumentError, InternalServerError } = require('../erros');

const jwt = require('jsonwebtoken');
const blacklist = require('../../redis/manipula-blacklist');
const crypto = require('crypto');

const nodemailer = require('nodemailer');

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

// É possível criar mecanismos para detectar roubo de refresh token
function criaRefreshToken(usuario) {
  const cincoDiasEmMilissegundos = 1000 * 60 * 60 * 24 * 5;
  const payload = JSON.stringify({
    id: usuario.id,
    exp: Date.now() + cincoDiasEmMilissegundos
  });
  // console.log(require('crypto').randomBytes(22).toString('base64'))
  // string de 32 caracteres
  const chave = process.env.CHAVE_REFRESH_TOKEN;
  const refreshToken = encripta(payload, chave);
  return refreshToken;
}

async function verificaRefreshToken(token) {
  if (!token) {
    throw new InvalidArgumentError('Refresh token inválido');
  }

  const chave = process.env.CHAVE_REFRESH_TOKEN;
  const payload = JSON.parse(decripta(token, chave));
  if (payload.exp < Date.now()) {
    throw new InvalidArgumentError('Refresh token expirado');
  }

  return payload;
}

function geraEndereco(id) {
  const payload = {id}
  const token = jwt.sign({ id }, process.env.CHAVE_JWT, { expiresIn: '1h' });
  const baseURL = process.env.BASE_URL;
  return `${baseURL}/usuario/verifica_email/${token}`;
}

async function enviaEmailverificacao(usuario) {
  // faz o curso com a conta teste + 'para saber mais' com dicas para produção?

  const contaTeste = await nodemailer.createTestAccount();

  const transportador = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    auth: contaTeste
  });

  const endereco = geraEndereco(usuario.id);
  const info = await transportador.sendMail({
    from: '"Blog do Código" <noreply@blogdocodigo.com.br>',
    to: usuario.email,
    subject: 'verificação de e-mail',
    text: `Olá! Confirme seu e-mail aqui: ${endereco}.`,
    html: `Olá! Confirme seu e-mail <a href="${endereco}">aqui</a>.`
  });
  console.log('URL:' + nodemailer.getTestMessageUrl(info));
}

module.exports = {
  async adiciona(req, res) {
    const { nome, email, senha } = req.body;

    try {
      const usuario = new Usuario({
        nome,
        email,
        emailverificado: false
      });

      await usuario.adicionaSenha(senha);

      await usuario.adiciona();

      // sem await a request não trava mas não sei como tratar eventuais erros
      enviaEmailverificacao(usuario).catch(console.error);

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

  async verificaEmail(req, res) {
    try {
      const payload = jwt.verify(req.params.token, process.env.CHAVE_JWT);
      const usuario = await Usuario.buscaPorId(payload.id);
      await usuario.verificaEmail();
      res.status(200).json();
    } catch (erro) {
      res.status(500).json({ erro: erro.message });
    }
  },

  async atualizaToken(req, res) {
    try {
      const refreshToken = req.body.refreshToken;
      const payload = await verificaRefreshToken(refreshToken);

      // talvez dê pra refatorar isso?
      const accessToken = criaTokenJWT(payload);
      const novoRefreshToken = criaRefreshToken(payload);

      // Precisa invalidar o refreshToken antigo
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
