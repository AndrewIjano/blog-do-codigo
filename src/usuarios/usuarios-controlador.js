module.exports = {
  login: (req, res) => {
    res.send('Página de login :)');
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
