const postsControlador = require('./posts-controlador');
const middlewaresAutenticacao = require('../usuarios/middlewares-autenticacao');

const passport = require('passport');

module.exports = app => {
  app
    .route('/post')
    .get(postsControlador.lista)
    .post(
      middlewaresAutenticacao.bearer,
      postsControlador.adiciona
    );
};
