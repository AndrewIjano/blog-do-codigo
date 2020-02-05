const postsControlador = require('./posts-controlador');
const { middlewareAutenticacao } = require('../usuarios');

module.exports = app => {
  app
    .route('/posts')
    .get(postsControlador.lista)
    .post(
      middlewareAutenticacao.bearer,
      postsControlador.adiciona
    );
};
