const usuariosControlador = require('./usuarios-controlador');
const passport = require('passport');

module.exports = app => {
  app
    .route('/login')
    .post(
      passport.authenticate('local', { session: false }),
      usuariosControlador.login
    );

  app.route('/registra').post(usuariosControlador.registra);

  app.route('/logout').get(usuariosControlador.logout);

  app.route('/usuario/:id').delete(usuariosControlador.deleta);
};
