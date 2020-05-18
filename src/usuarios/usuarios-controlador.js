const Usuario = require('./usuarios-modelo');
const tokens = require('./tokens');
const { EmailVerificacao, EmailAtualizaSenha } = require('./emails');

const { InvalidArgumentError } = require('../erros');

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
        emailVerificado: false
      });
      await usuario.adicionaSenha(senha);
      usuario.adicionaChaveAutenticacaoDoisFatores();
      await usuario.adiciona();

      const token = tokens.verificacaoEmail.cria(usuario.id);
      const endereco = geraEndereco('/usuario/verifica_email/', token);
      const emailVerificacao = new EmailVerificacao(usuario, endereco);
      emailVerificacao.enviaEmail().catch(console.error);

      const { chaveAutenticacaoDoisFatores } = usuario;
      res.status(201).json({ chaveAutenticacaoDoisFatores });
    } catch (erro) {
      if (erro instanceof InvalidArgumentError) {
        return res.status(422).json({ erro: erro.message });
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

  async login(req, res) {
    try {
      const { id } = req.user;
      const token = tokens.segundaEtapa.cria(id);
      const endereco = geraEndereco('/usuario/login/', token);
      res.location(endereco);
      res.status(303).json();
    } catch (erro) {
      res.status(500).json({ erro: erro.message });
    }
  },

  async segundaEtapaAutenticacao(req, res) {
    const { id } = req.user;
    const accessToken = tokens.access.cria(id);
    const refreshToken = await tokens.refresh.cria(id);
    res.set('Authorization', accessToken);
    res.status(200).json({ refreshToken });
  },

  async logout(req, res) {
    try {
      await tokens.access.invalida(req.token);
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

  async esqueciSenha(req, res) {
    try {
      // precisa verificar se o usuário que faz a requisição é válido?
      const { email } = req.body;
      const usuario = await Usuario.buscaPorEmail(email);

      verificaUsuarioExiste(usuario);
      verificaEmailVerificado(usuario);

      const token = await tokens.atualizacaoSenha.cria(usuario.id);
      const endereco = geraEndereco('/usuario/senha/', token);
      const emailAtualizaSenha = new EmailAtualizaSenha(usuario, endereco);
      emailAtualizaSenha.enviaEmail().catch(console.error);
      res.status(202).json();
    } catch (erro) {
      if (erro instanceof InvalidArgumentError) {
        return res.status(400).json({ erro: erro.message });
      }

      res.status(500).json({ erro: erro.message });
    }
  },

  async atualizaSenha(req, res) {
    try {
      const { senha } = req.body;
      const usuario = req.user;
      await usuario.modificaSenha(senha);

      await tokens.atualizacaoSenha.invalida(req.token);
      res.status(200).json();
    } catch (erro) {
      if (erro instanceof InvalidArgumentError) {
        return res.status(422).json({ erro: erro.message });
      }
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
