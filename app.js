const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const autenticacao = require('./src/usuarios').autenticacao;

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

autenticacao(app);

module.exports = app;
