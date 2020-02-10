const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const BearerStrategy = require('passport-http-bearer');
const jwt = require('jsonwebtoken');

const { InvalidArgumentError } = require('../../erros');
const blacklist = require('../../blacklist');
const Usuario = require('./usuarios-modelo');

function verificaUsuario(usuario) {
  if (!usuario) {
    throw new InvalidArgumentError('Não existe usuário com esse e-mail!');
  }
}

async function verificaSenha(senha, senhaHash) {
  const senhaCorreta = await bcrypt.compare(senha, senhaHash);

  if (!senhaCorreta) {
    throw new InvalidArgumentError('Login ou senha incorretos');
  }
}

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
          verificaUsuario(usuario);
          await verificaSenha(senha, usuario.senhaHash);

          return done(null, usuario);
        } catch (erro) {
          done(erro);
        }
      }
    )
  );

  passport.use(
    new BearerStrategy(async (token, done) => {
      try {
        const tokenNaBlacklist = await blacklist.buscaToken(token);
        if (tokenNaBlacklist) {
          throw new jwt.TokenExpiredError('Token inválido por logout!');
        }

        const payload = jwt.verify(token, process.env.JWT_KEY);
        const usuario = await Usuario.buscaPorId(payload.id);

        return done(null, usuario);
      } catch (erro) {
        return done(erro);
      }
    })
  );
};
