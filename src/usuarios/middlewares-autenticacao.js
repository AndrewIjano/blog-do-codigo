const passport = require('passport');
const speakeasy = require('speakeasy');

module.exports = {
  bearer: (req, res, next) => {
    passport.authenticate(
      'bearer',
      { session: false },
      (erro, usuario, info) => {
        if (erro && erro.name === 'TokenExpiredError') {
          return res
            .status(400)
            .send({ erro: erro.message});
        }

        if (erro && erro.name === 'JsonWebTokenError') {
          return res.status(422).send({ erro: erro.message });
        }

        if (erro) {
          return res.status(500).send({ erro: erro.message });
        }

        req.user = usuario;
        return next();
      }
    )(req, res, next);
  },

  local: (req, res, next) => {
    passport.authenticate(
      'local',
      { session: false },
      (erro, usuario, info) => {
        if (erro && erro.nome === 'InvalidArgumentError') {
          return res.status(422).send({ erro: erro.message });
        }

        if (erro) {
          return res.status(500).send({ erro: erro });
        }

        req.user = usuario;
        return next();
      }
    )(req, res, next);
  },

  doisFatores: (req, res, next) => {
    if (!req.headers.authorization) {
      return res.status(403);
    }
    
    const token = req.headers.authorization;
    const tokenValido = speakeasy.totp.verify({
      secret: req.user.chaveAutenticacaoDoisFatores,
      encoding: 'base32',
      token: token
    });

    if (!tokenValido) {
      return res.status(400).send({ erro: 'Token de autenticação inválido' });
    }

    next();
  }
};
