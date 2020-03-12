const passport = require('passport');

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
  }
};
