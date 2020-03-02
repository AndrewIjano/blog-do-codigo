const usuariosControlador = require('./usuarios-controlador');
const middlwaresAutenticacao = require('./middlewares-autenticacao');

module.exports = app => {
  app
    .route('/registra')
    .get(usuariosControlador.lista)
    .post(usuariosControlador.registra);

  app
    .route('/login')
    .post(
      passport.authenticate('local', { session: false }),
      usuariosControlador.login
    );

  app
    .route('/usuario/login')
    .post(
      middlwaresAutenticacao.local,
      usuariosControlador.login
    );

  app
    .route('/usuario/:id')
    .delete(
      middlwaresAutenticacao.bearer,
      usuariosControlador.deleta
    );
};
