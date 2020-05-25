const passport = require('passport');
const tokens = require('./tokens');
const Usuario = require('./usuarios-modelo');

module.exports = {
  local(req, res, next) {
    passport.authenticate(
      'local',
      { session: false },
      (erro, usuario, info) => {
        if (erro && erro.name === 'InvalidArgumentError') {
          return res.status(401).json({ erro: erro.message });
        }

        if (erro) {
          return res.status(500).json({ erro: erro.message });
        }

        if (!usuario) {
          return res.status(401).json();
        }

        req.user = usuario;
        return next();
      }
    )(req, res, next);
  },

  bearer(req, res, next) {
    passport.authenticate(
      'bearer',
      { session: false },
      (erro, usuario, info) => {
        if (erro && erro.name === 'JsonWebTokenError') {
          return res.status(401).json({ erro: erro.message });
        }

        if (erro && erro.name === 'TokenExpiredError') {
          return res
            .status(401)
            .json({ erro: erro.message, expiradoEm: erro.expiredAt });
        }

        if (erro) {
          return res.status(500).json({ erro: erro.message });
        }

        if (!usuario) {
          return res.status(401).json();
        }

        req.token = info.token;
        req.user = usuario;
        return next();
      }
    )(req, res, next);
  },

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const id = await tokens.refresh.verifica(refreshToken);
      await tokens.refresh.invalida(refreshToken);
      req.user = await Usuario.buscaPorId(id); // talvez verificar se o usuário ainda existe
      return next();
    } catch (erro) {
      if (erro.name === 'InvalidArgumentError') {
        return res.status(401).json({ erro: erro.message });
      }
      return res.status(500).json({ erro: erro.message });
    }
  },

  async verificaEmail(req, res, next) {
    try {
      const { token } = req.params;
      const id = await tokens.verificacaoEmail.verifica(token);
      req.user = await Usuario.buscaPorId(id);
      return next();
    } catch (erro) {
      if (erro.name === 'InvalidArgumentError') {
        return res.status(401).json({ erro: erro.message });
      }
      return res.status(500).json({ erro: erro.message });
    }
  },

  async atualizaSenha(req, res, next) {
    try {
      const { token } = req.params;
      const id = await tokens.atualizacaoSenha.verifica(token);
      req.user = await Usuario.buscaPorId(id);
      req.token = token;
      return next();
    } catch (erro) {
      if (erro.name === 'InvalidArgumentError') {
        return res.status(401).json({ erro: erro.message });
      }
      return res.status(500).json({ erro: erro.message });
    }
  },

  async doisFatores(req, res, next) {
    try {
      const { tokenSegundaEtapa } = req.params;
      const id = await tokens.segundaEtapa.verifica(tokenSegundaEtapa);
      const usuario = await Usuario.buscaPorId(id);

      const token = req.headers.authorization;
      tokens.totp.verifica(token, usuario.chaveAutenticacaoDoisFatores);
      
      req.user = usuario;
      return next();
    } catch (erro) {
      if (erro.name === 'InvalidArgumentError') {
        return res.status(401).json({ erro: erro.message });
      }
      res.status(500).json({ erro: erro.message });
    }
  }
};
