const Post = require('./posts-modelo');

module.exports = {
  adiciona: (req, res) => {
    try {
      const post = new Post(req.body);

      post
        .adiciona()
        .then(() => {
          res.redirect('/posts');
        })
        .catch(err => {
          return res.status(500).json({ erro: err });
        });
    } catch (err) {
      res.status(422).json({ erro: err.message });
    }
  },

  lista: (req, res) => {
    Post.lista()
      .then(posts => {
        res.send(posts);
      })
      .catch(err => {
        return res.status(500).json({ erro: err });
      });
  }
};
