const Usuario = require('./usuarios-modelo');
const { InvalidArgumentError } = require('../erros');
const tokens = require('./tokens');
const { EmailVerificacao, EmailAtualizacaoSenha } = require('./emails');

function geraEndereco(rota, token) {
  const baseURL = process.env.BASE_URL;
  return `${baseURL}${rota}${token}`;
}

function verificaUsuarioExiste(usuario) {
  if (!usuario) {
    throw new InvalidArgumentError('Não existe usuário com esse e-mail!');
  }
}

function verificaEmailVerificado(usuario) {
  if (!usuario.emailVerificado) {
    throw new InvalidArgumentError('E-mail não verificado!');
  }
}

module.exports = {
  async adiciona(req, res) {
    const { nome, email, senha } = req.body;

    try {
      const usuario = new Usuario({
        nome,
        email,
        emailVerificado: false,
      });
      await usuario.adicionaSenha(senha);
      await usuario.adiciona();

      const token = tokens.verificacaoEmail.cria(usuario.id);
      const endereco = geraEndereco('/usuario/verifica_email/', token);
      const emailVerificacao = new EmailVerificacao(usuario, endereco);
      emailVerificacao.enviaEmail().catch(console.error);

      res.status(201).json();
    } catch (erro) {
      if (erro instanceof InvalidArgumentError) {
        return res.status(400).json({ erro: erro.message });
      }
      res.status(500).json({ erro: erro.message });
    }
  },

  async verificaEmail(req, res) {
    try {
      const usuario = req.user;
      await usuario.verificaEmail();
      res.status(200).json();
    } catch (erro) {
      res.status(500).json({ erro: erro.message });
    }
  },

  async recuperaConta(req, res) {
    try {
      const { email } = req.body;
      const usuario = await Usuario.buscaPorEmail(email);

      verificaUsuarioExiste(usuario);
      verificaEmailVerificado(usuario);

      const endereco = geraEndereco('/usuario/recupera_conta/', 'TOKEN');
      const emailAtualizacaoSenha = new EmailAtualizacaoSenha(
        usuario,
        endereco
      );
      emailAtualizacaoSenha.enviaEmail().catch(console.error);

      res.status(200).json();
    } catch (erro) {
      if (erro instanceof InvalidArgumentError) {
        res.status(400).json({ erro: erro.message });
      }
      res.status(500).json({ erro: erro.message });
    }
  },

  async login(req, res) {
    try {
      const usuario = req.user;
      const accessToken = tokens.access.cria(usuario.id);
      const refreshToken = await tokens.refresh.cria(usuario.id);
      res.set('Authorization', accessToken);
      res.status(200).json({ refreshToken });
    } catch (erro) {
      res.status(500).json({ erro: erro.message });
    }
  },

  async logout(req, res) {
    try {
      const token = req.token;
      await tokens.access.invalida(token);
      res.status(200).json();
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
  },
};
