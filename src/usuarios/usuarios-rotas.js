const usuariosControlador = require('./usuarios-controlador');
const passport = require('passport');
const middlewareAutenticacao = require('./middleware-autenticacao');

module.exports = app => {
  app
    .route('/login')
    .post(
      middlewareAutenticacao.local,
      usuariosControlador.login
    );

  app.route('/registra').post(usuariosControlador.registra);

  app.route('/logout').get(usuariosControlador.logout);

  app.route('/usuario/:id').delete(usuariosControlador.deleta);
};
