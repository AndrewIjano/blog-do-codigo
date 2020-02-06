const usuariosControlador = require('./usuarios-controlador');
const middlewareAutenticacao = require('./middleware-autenticacao');

module.exports = app => {
  app
    .route('/login')
    .post(
      [middlewareAutenticacao.local, middlewareAutenticacao.doisFatores],
      usuariosControlador.login
    );

  app.route('/registra').post(usuariosControlador.registra);

  app
    .route('/logout')
    .get(middlewareAutenticacao.bearer, usuariosControlador.logout);

  app
    .route('/usuario/:id')
    .delete(middlewareAutenticacao.bearer, usuariosControlador.deleta);
};
