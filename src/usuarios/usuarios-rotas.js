const usuariosControlador = require('./usuarios-controlador');
const passport = require('passport');

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
    .route('/usuario/:id')
    .delete(
      passport.authenticate('bearer', { session: false }),
      usuariosControlador.deleta
    );
};
