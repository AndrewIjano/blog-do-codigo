const usuariosControlador = require('./usuarios-controlador');
const middlewaresAutenticacao = require('./middlewares-autenticacao');

module.exports = app => {
  app
    .route('/usuario/atualiza_token')
    .post(middlewaresAutenticacao.refresh, usuariosControlador.login);

  app
    .route('/usuario/verifica_email/:token')
    .get(
      middlewaresAutenticacao.verificaEmail,
      usuariosControlador.verificaEmail
    );

  app.route('/usuario/esqueci_senha').post(usuariosControlador.esqueciSenha);

  app
    .route('/usuario/senha/:token')
    .put(
      middlewaresAutenticacao.atualizaSenha,
      usuariosControlador.atualizaSenha
    );

  app
    .route('/usuario/login')
    .post(middlewaresAutenticacao.local, usuariosControlador.login);

  app
    .route('/usuario/login/:id')
    .get(
      middlewaresAutenticacao.doisFatores,
      usuariosControlador.segundaEtapaAutenticacao
    );

  app
    .route('/usuario/logout')
    .get(middlewaresAutenticacao.bearer, usuariosControlador.logout);

  app
    .route('/usuario')
    .post(usuariosControlador.adiciona)
    .get(usuariosControlador.lista);

  app
    .route('/usuario/:id')
    .delete(middlewaresAutenticacao.bearer, usuariosControlador.deleta);
};
