const passport = require('passport');

module.exports = {
  bearer: (req, res, next) => {
    passport.authenticate(
      'bearer',
      { session: false },
      (erro, usuario, info) => {
        if (erro && erro.name === 'TokenExpiredError') {
          return res
            .status(400)
            .send({ erro: erro.message, expiradoEm: erro.expiredAt });
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
  }
};
