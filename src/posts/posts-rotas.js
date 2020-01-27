const postsControlador = require('./posts-controlador');

module.exports = app => {
  app
    .route('/posts')
    .get(postsControlador.lista)
    .post(postsControlador.adiciona);
};
