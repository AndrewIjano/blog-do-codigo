const Usuario = require('./usuarios-modelo');
const { InvalidArgumentError, InternalServerError } = require('../erros');

const jwt = require('jsonwebtoken');
const blacklist = require('../../redis/manipula-blacklist');
const tokensAtualizaSenha = require('../../redis/tokens-atualiza-senha');
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

function geraEndereco(token, url) {
  const baseURL = process.env.BASE_URL;
  return `${baseURL}${url}/?token=${token}`;
}

function geraEnderecoVerificaEmail(id) {
  const payload = { id };
  const token = jwt.sign(payload, process.env.CHAVE_JWT, { expiresIn: '1h' });
  return geraEndereco(token, '/usuario/verifica_email');
}

async function enviaEmailVerificacao(usuario) {
  const endereco = geraEnderecoVerificaEmail(usuario.id);
  await enviaEmail({
    from: '"Blog do Código" <noreply@blogdocodigo.com.br>',
    to: usuario.email,
    subject: 'Verificação de e-mail',
    text: `Olá! Confirme seu e-mail aqui: ${endereco}.`,
    html: `Olá! Confirme seu e-mail <a href="${endereco}">aqui</a>.`
  });
}

async function enviaEmailAtualizaSenha(usuario) {
  const token = crypto.randomBytes(24).toString('hex');
  const endereco = geraEndereco(token, '/usuario/senha');

  const umaHoraEmMilissegundos = 1000 * 60 * 60;
  await tokensAtualizaSenha.adiciona(
    token,
    usuario.id,
    Date.now() + umaHoraEmMilissegundos
  );

  await enviaEmail({
    from: '"Blog do Código" <noreply@blogdocodigo.com.br>',
    to: usuario.email,
    subject: 'Atualização de senha',
    text: `Olá! Atualize sua senha aqui: ${endereco}.`,
    html: `Olá! Atualize sua senha <a href="${endereco}">aqui</a>.`
  });
}

async function enviaEmail(emailInfo) {
  // faz o curso com a conta teste + 'para saber mais' com dicas para produção?
  const contaTeste = await nodemailer.createTestAccount();

  const transportador = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    auth: contaTeste
  });

  const resultado = await transportador.sendMail(emailInfo);
  console.log('URL:' + nodemailer.getTestMessageUrl(resultado));
}

module.exports = {
  async adiciona(req, res) {
    const { nome, email, senha } = req.body;

    try {
      const usuario = new Usuario({
        nome,
        email,
        emailVerificado: false
      });

      await usuario.adicionaSenha(senha);

      await usuario.adiciona();

      // sem await a request não trava mas não sei como tratar eventuais erros
      enviaEmailVerificacao(usuario).catch(console.error);

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
      const token = req.query.token;
      if (!token) {
        return res.status(404).json();
      }

      const payload = jwt.verify(token, process.env.CHAVE_JWT);
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

  async esqueciSenha(req, res) {
    try {
      // o usuário pode não saber seu id para fazer a requisição na api
      // precisa verificar se o usuário que faz a requisição é válido
      const id = req.params.id;
      const usuario = await Usuario.buscaPorId(id);

      // pode ser falha de segurança
      // mostra quais ids possuem usuários e quais não
      if (!usuario) {
        throw new InvalidArgumentError('Usuário inválido!');
      }

      // talvez mudar o tipo do erro para ter um código HTTP coerente
      if (!usuario.emailVerificado) {
        throw new InvalidArgumentError('E-mail não verificado!');
      }

      enviaEmailAtualizaSenha(usuario).catch(console.error);
      res.status(202).json();
    } catch (erro) {
      if (erro instanceof InvalidArgumentError) {
        return res.status(403).json({ erro: erro.message });
      }

      res.status(500).json({ erro: erro.message });
    }
  },

  async atualizaSenha(req, res) {
    try {
      const { senha } = req.body;
      const token = req.query.token;

      if (!token || !(await tokensAtualizaSenha.contemChave(token))) {
        return res.status(404).json();
      }

      const id = await tokensAtualizaSenha.buscaId(token);
      const usuario = await Usuario.buscaPorId(id);
      await usuario.modificaSenha(senha);

      // token só pode ser usado uma vez
      await tokensAtualizaSenha.deleta(token);

      res.status(200).json();
    } catch (erro) {
      if (erro instanceof InvalidArgumentError) {
        return res.status(422).json({ erro: erro.message });
      }
      res.status(500).json({ erro: erro.message });
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
