require('dotenv').config()

const app = require('./app');
const port = 3000;
require('./database');
require('./redis/blacklist-access-token');
require('./redis/whitelist-refresh-token');

const routes = require('./rotas');
routes(app);

app.listen(port);
