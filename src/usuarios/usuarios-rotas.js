const usuariosControlador = require('./usuarios-controlador');
const middlwaresAutenticacao = require('./middlewares-autenticacao');

module.exports = app => {
  app
    .route('/usuario')
    .get(usuariosControlador.lista)
    .post(usuariosControlador.adiciona);

  app
    .route('/usuario/login/:id')
    .post(
      middlwaresAutenticacao.doisFatores,
      usuariosControlador.segundaEtapaAutenticacao
    );
    
  app
    .route('/usuario/login')
    .post(middlwaresAutenticacao.local, usuariosControlador.login);

  app
    .route('/usuario/logout')
    .get(middlwaresAutenticacao.bearer, usuariosControlador.logout);

  app
    .route('/usuario/:id')
    .delete(middlwaresAutenticacao.bearer, usuariosControlador.deleta);
};
