const usuariosControlador = require('./usuarios-controlador');

module.exports = app => {

  app.route('/registra').post(usuariosControlador.registra);

  app
    .route('/usuario/:id')
    .delete(usuariosControlador.deleta);
};
