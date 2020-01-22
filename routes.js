const posts = require('./src/posts');

module.exports = app => {
  app.get('/', (req, res) => {res.send('Hello world!')});
  
  posts.routes(app);

};