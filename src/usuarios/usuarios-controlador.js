const Usuario = require('./usuarios-modelo');

module.exports = {
  registra: (req, res) => {
    try {
      const usuario = new Usuario(req.body);

      usuario
        .adiciona()
        .then(() => {
          res.send('Registrado :)');
        })
        .catch(erro => {
          res.status(500).json({ erro: erro });
        });
    } catch (erro) {
      res.status(422).json({ erro: erro.message });
    }
  },
  login: (req, res) => {
    res.send('Página de login :)');
  },
  logout: (req, res) => {
    req.logout();
    res.send('Logout OK!');
  },
  efetuaLogin: (req, res, next) => {
    const passport = req.passport;

    passport.authenticate('local', (erro, usuario, info) => {
      if (erro) {
        return next(erro);
      }

      req.login(usuario, erro => {
        if (erro) {
          return next(erro);
        }
        return res.send('Login OK!');
      });
    })(req, res, next);
  },
  autentica: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    } else {
      res.redirect('/login');
    }
  }
};
