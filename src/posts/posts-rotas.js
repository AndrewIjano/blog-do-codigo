const postsControlador = require('./posts-controlador');
const usuariosControlador = require('../usuarios').controlador;

module.exports = app => {
  app
    .route('/posts')
    .get(postsControlador.lista)
    .post(usuariosControlador.autentica, postsControlador.adiciona);
};
