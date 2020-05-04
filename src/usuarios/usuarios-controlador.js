const Usuario = require('./usuarios-modelo');
const { InvalidArgumentError, InternalServerError } = require('../erros');
const tokens = require('./tokens-autenticacao');

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

  async login(req, res) {
    try {
      const { accessToken, refreshToken } = await tokens.criaTokens(req.user.id);
      res.set('Authorization', accessToken);
      res.status(200).json({ refreshToken });
    } catch (erro) {
      res.status(500).json({ erro: erro.message });
    }
  },

  async logout(req, res) {
    try {
      await tokens.invalidaAccessToken(req.token);
      // TODO invalidar também o refresh token
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
