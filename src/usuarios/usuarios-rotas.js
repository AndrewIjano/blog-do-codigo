const usuariosControlador = require('./usuarios-controlador');
const middlwaresAutenticacao = require('./middlewares-autenticacao');

module.exports = app => {
  app
    .route('/usuario')
    .get(usuariosControlador.lista)
    .post(usuariosControlador.adiciona);

  app
    .route('/usuario/login')
    .post(middlwaresAutenticacao.local, usuariosControlador.login);

  app
    .route('/usuario/:id')
    .delete(middlwaresAutenticacao.bearer, usuariosControlador.deleta);
};
