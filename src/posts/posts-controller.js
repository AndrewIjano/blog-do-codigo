const { validationResult } = require('express-validator/check');
const Post = require('./posts-model');

module.exports = {
  add: (req, res) => {
    const post = new Post(req.title, req.content);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    post
      .add()
      .then(res.redirect('/posts'))
      .catch(err => console.error(err));
  },
  list: (req, res) => {
    Post.all()
      .then(posts => {
        res.send(posts);
      })
      .catch(err => console.error(err));
  }
};
