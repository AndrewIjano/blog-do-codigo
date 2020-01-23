const { validationResult } = require('express-validator');
const Post = require('./posts-modelo');

module.exports = {
  adiciona: (req, res) => {
    const post = new Post(req.body);

    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(422).json({ erros: erros.array() });
    }

    post
      .adiciona()
      .then(res.redirect('/posts'))
      .catch(err => console.error(err));
  },
  lista: (req, res) => {
    Post.lista()
      .then(posts => {
        res.send(posts);
      })
      .catch(err => console.error(err));
  }
};
