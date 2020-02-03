const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const bcrypt = require('bcrypt');

const Usuario = require('./usuarios-modelo');

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

  passport.use(
    new JWTStrategy(
      {
        jwtFromRequest: req => req.cookies.jwt,
        secretOrKey: 'secret'
      },
      (payload, done) => {
        return done(null, payload);
      }
    )
  );

  app.use((req, res, next) => {
    req.passport = passport;
    next();
  });
};
