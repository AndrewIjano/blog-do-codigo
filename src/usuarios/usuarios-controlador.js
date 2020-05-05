const Usuario = require('./usuarios-modelo');
const { InvalidArgumentError } = require('../erros');
const tokens = require('./tokens-autenticacao');
const { EmailVerificacao } = require('./emails');
const jwt = require('jsonwebtoken');

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

      const emailVerificacao = new EmailVerificacao(usuario);
      emailVerificacao.enviaEmail().catch(console.error);

      res.status(201).json();
    } catch (erro) {
      if (erro instanceof InvalidArgumentError) {
        return res.status(422).json({ erro: erro.message });
      }
      res.status(500).json({ erro: erro.message });
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
      const token = req.params.token;

      if (!(await tokensAtualizaSenha.contemChave(token))) {
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
      const { accessToken, refreshToken } = await tokens.criaTokens(
        req.user.id
      );
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
