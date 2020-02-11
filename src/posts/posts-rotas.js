const postsControlador = require('./posts-controlador');
const { middlewaresAutenticacao } = require('../usuarios');

module.exports = app => {
  app
    .route('/posts')
    .get(postsControlador.lista)
    .post(
      middlewaresAutenticacao.bearer,
      postsControlador.adiciona
    );
};
