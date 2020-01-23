const postsControlador = require('./posts-controlador');
const Post = require('./posts-modelo');

module.exports = app => {
  app
    .route('/posts')
    .get(postsControlador.lista)
    .post(Post.regrasValidacao(), Post.valida, postsControlador.adiciona);
};
