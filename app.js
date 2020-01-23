const express = require('express');
const app = express();
<<<<<<< HEAD
=======
const port = 3000;

const db = require('./database');
const routes = require('./rotas');
const usuarios = require('./src/usuarios');

>>>>>>> Add user authentication
const bodyParser = require('body-parser');

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

<<<<<<< HEAD
module.exports = app;
=======
usuarios.autenticacao(app);

routes(app);

app.listen(port, () => console.log(`App ouvindo na porta ${port}`));
>>>>>>> Add user authentication
