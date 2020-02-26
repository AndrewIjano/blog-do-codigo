const passport = require('passport');

const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const BearerStrategy = require('passport-http-bearer').Strategy;
const jwt = require('jsonwebtoken');

const Usuario = require('./usuarios-modelo');

const { InvalidArgumentError } = require('../erros');

function verificaUsuario(usuario) {
  if (!usuario) {
    throw new InvalidArgumentError('Não existe usuário com esse e-mail!');
  }
}

async function verificaSenha(senha, senhaHash) {
  const senhaCorreta = await bcrypt.compare(senha, senhaHash);

  if (!senhaCorreta) {
    throw new InvalidArgumentError('E-mail ou senha incorretos!');
  }
}

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'senha',
      session: false
    },
    async (email, senha, done) => {
      try {
        const usuario = await Usuario.buscaPorEmail(email);
        verificaUsuario(usuario);
        await verificaSenha(senha, usuario.senhaHash);

        done(null, usuario);
      } catch (erro) {
        done(erro);
      }
    }
  )
);

passport.use(
  new BearerStrategy(async (token, done) => {
    try {
      const payload = jwt.verify(token, process.env.CHAVE_JWT);

      const usuario = await Usuario.buscaPorId(payload.id);
      done(null, usuario);
    } catch (erro) {
      done(erro);
    }
  })
);
