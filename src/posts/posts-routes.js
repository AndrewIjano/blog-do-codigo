const postsController = require('./posts-controller');
const Post = require('./posts-model');

module.exports = app => {
  app
    .route('/posts')
    .get(postsController.list)
    .post(Post.validator(), postsController.add);
};
