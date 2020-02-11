const usuariosControlador = require('./usuarios-controlador');
const middlewareAutenticacao = require('./middlewares-autenticacao');

module.exports = app => {
  
  // pode gerar um link primeiro e realizar a autenticacao dois fatores
  // em outra rota
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
