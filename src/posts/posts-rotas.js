const postsControlador = require('./posts-controlador');
const usuariosControlador = require('../usuarios').controlador;
const passport = require('passport');

module.exports = app => {
  app
    .route('/posts')
    .get(postsControlador.lista)
    .post(
      passport.authenticate('bearer', { session: false }),
      postsControlador.adiciona
    );
};
