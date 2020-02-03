const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { autenticacao } = require('./src/usuarios');

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.use(cookieParser());

autenticacao(app);

module.exports = app;
