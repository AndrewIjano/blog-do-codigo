const usuariosControlador = require('./usuarios-controlador');

module.exports = app => {
  app
    .route('/login')
    .get(usuariosControlador.login)
    .post(usuariosControlador.efetuaLogin);

  app.route('/registra').post(usuariosControlador.registra);

  app.route('/logout').get(usuariosControlador.logout);
};
