const usuariosControlador = require('./usuarios-controlador');

module.exports = app => {

  app.route('/usuario').post(usuariosControlador.adiciona);

  app
    .route('/usuario/:id')
    .delete(usuariosControlador.deleta);
};
