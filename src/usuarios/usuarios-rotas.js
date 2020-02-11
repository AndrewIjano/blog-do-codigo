const usuariosControlador = require('./usuarios-controlador');
const middlewaresAutenticacao = require('./middlewares-autenticacao');

module.exports = app => {
  
  // pode gerar um link primeiro e realizar a autenticacao dois fatores
  // em outra rota
  app
    .route('/login')
    .post(
      [middlewaresAutenticacao.local, middlewaresAutenticacao.doisFatores],
      usuariosControlador.login
    );

  app.route('/registra').post(usuariosControlador.registra);

  app
    .route('/logout')
    .get(middlewaresAutenticacao.bearer, usuariosControlador.logout);

  app
    .route('/usuario/:id')
    .delete(middlewaresAutenticacao.bearer, usuariosControlador.deleta);
};
