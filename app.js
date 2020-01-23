const express = require('express');
const app = express();
const port = 3000;

const db = require('./database');
const routes = require('./rotas');

const bodyParser = require('body-parser');

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

routes(app);

app.listen(port, () => console.log(`App listening on port ${port}`));
