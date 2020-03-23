const passport = require('passport');
const Usuario = require('./usuarios-modelo');
const speakeasy = require('speakeasy');

module.exports = {
  local: (req, res, next) => {
    passport.authenticate(
      'local',
      { session: false },
      (erro, usuario, info) => {
        if (erro && erro.name === 'InvalidArgumentError') {
          return res.status(401).send({ erro: erro.message });
        }

        if (!usuario && !erro) {
          return res.status(401).send();
        }

        if (erro) {
          return res.status(500).send({ erro: erro.message });
        }

        req.user = usuario;
        return next();
      }
    )(req, res, next);
  },

  bearer: (req, res, next) => {
    passport.authenticate(
      'bearer',
      { session: false },
      (erro, usuario, info) => {
        if (erro && erro.name === 'JsonWebTokenError') {
          return res.status(401).send({ erro: erro.message });
        }

        if (erro && erro.name === 'TokenExpiredError') {
          return res
            .status(401)
            .send({ erro: erro.message, expiradoEm: erro.expiredAt });
        }

        if (!usuario && !erro) {
          return res.status(401).send();
        }

        if (erro) {
          return res.status(500).send({ erro: erro.message });
        }

        req.user = usuario;
        return next();
      }
    )(req, res, next);
  },

  doisFatores: async (req, res, next) => {
    try {
      if (!req.headers.authorization) {
        return res.status(401).send();
      }
      const usuario = await Usuario.buscaPorId(req.params.id);

      const token = req.headers.authorization;
      const tokenValido = speakeasy.totp.verify({
        secret: usuario.chaveAutenticacaoDoisFatores,
        encoding: 'base32',
        token: token
      });

      if (!tokenValido) {
        return res.status(401).json({ erro: 'Token inválido!' });
      }

      req.user = usuario;
      return next();
    } catch (erro) {
      res.status(500).json({ erro: erro });
    }
  }
};
