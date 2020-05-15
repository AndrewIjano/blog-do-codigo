const passport = require('passport');
const tokens = require('./tokens-autenticacao');
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
      const id = await tokens.verificaRefreshToken(refreshToken);
      await tokens.invalidaRefreshToken(refreshToken);
      req.user = await Usuario.buscaPorId(id); // talvez verificar se o usuário ainda existe
      return next();
    } catch (erro) {
      if (erro.name === 'InvalidArgumentError') {
        return res.status(401).json({ erro: erro.message });
      }
      return res.status(500).json({ erro: erro.message });
    }
  }
};
