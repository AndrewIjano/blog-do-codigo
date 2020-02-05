const app = require('./app');
const port = 3000;
const db = require('./database');
const routes = require('./rotas');

routes(app);

process.env.JWT_KEY = 'nYZXLCq0M0+mDGCGgV2vBtCeTbioAkL73zGXwtptcK4rHckyHzjj5zQpOR3dfebIxDg8EgOx9asaXJQ86yyuq5xoRoroPPoS454LQRIYJRdNhfDfxfRUUn61uDRT3dtM5yGoL4OlTkn0wTTWK+gKKPQFu8AEzNDjUqzw2/JaL+DJDghFvNfneXiXGe/0pERUv7QBg3xJ0Sh3AoLjYS8nB8lMJUNlzpr/RCBNCXnjOYJtltAzVL1Zw90k9sYxpRsmkM35eIKIyCr7Fmb/J2jtaKGe93WLt75iVnOXAila+kbQuuWuA39WHp3CZ6lx4NaXZWeotw4wXVFf9OjEtZ7SWw==';

app.listen(port, () => console.log(`App listening on port ${port}`));
