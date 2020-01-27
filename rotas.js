const posts = require('./src/posts');
module.exports = app => {
  app.get('/', (req, res) => {res.send('Olá pessoa!')});
  
  posts.rotas(app);

};