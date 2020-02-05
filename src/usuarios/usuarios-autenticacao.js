const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const BearerStrategy = require('passport-http-bearer');
const jwt = require('jsonwebtoken');


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
    new BearerStrategy(
      async (token, done) => {
        try {
          const payload = jwt.verify(token, process.env.JWT_KEY);
          const usuario = await Usuario.buscaPorId(payload.id);

          return done(null, usuario);
        } catch (erro) {
          return done(erro);
        }
      }
    )
  );

};
