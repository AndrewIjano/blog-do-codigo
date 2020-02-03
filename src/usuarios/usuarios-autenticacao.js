const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Usuario = require('./usuarios-modelo');
const sessao = require('express-session');
const bcrypt = require('bcrypt');

module.exports = app => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'senha'
      },
      async (email, senha, done) => {
        try {
          const usuario = await Usuario.buscaPorEmail(email);
          if (!usuario) {
            return done(null, false, {
              mensagem: 'Não existe usuário com esse e-mail!'
            });
          }

          const senhaCorreta = await bcrypt.compare(senha, usuario.senhaHash);

          if (!senhaCorreta) {
            return done(null, false, {
              mensagem: 'Login ou senha incorretos'
            });
          }

          return done(null, usuario);
        } catch (erro) {
          done(erro);
        }
      }
    )
  );

  passport.serializeUser((usuario, done) => done(null, usuario.id));
  passport.deserializeUser((usuarioId, done) => {
    Usuario.buscaPorId(usuarioId)
      .then(usuario => done(null, usuario))
      .catch(erro => done(erro));
  });

  app.use(passport.initialize());

  app.use((req, res, next) => {
    req.passport = passport;
    next();
  });
};
