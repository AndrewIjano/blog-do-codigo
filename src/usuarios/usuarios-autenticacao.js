const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Usuario = require('./usuarios-modelo');
const sessao = require('express-session');

module.exports = app => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'senha'
      },
      (email, senha, done) => {
        Usuario.buscaPorEmail(email)
          .then(usuario => {
            if (!usuario || senha != usuario.senha) {
              return done(null, false, {
                mensagem: 'Login ou senha incorretos'
              });
            }

            return done(null, usuario);
          })
          .catch(erro => done(erro));
      }
    )
  );

  passport.serializeUser((usuario, done) => done(null, usuario.id));
  passport.deserializeUser((usuarioId, done) => {
    Usuario.buscaPorId(usuarioId)
      .then(usuario => done(null, usuario))
      .catch(erro => done(erro));
  });

  app.use(sessao({ 
    secret: 'alura!!',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true
    }  
  }));

  app.use(passport.initialize());
  app.use(passport.session());
  
  app.use((req, res, next) => {
    req.passport = passport;
    next();
  });
};
