const postgres = require("pg");
require('dotenv').config();

const database = new postgres.Pool({
    host: process.env.HOST,
    port: process.env.PORT_DATABASE,
    database: process.env.DATABASE,
    user: process.env.USERNAME_DB, // O nome correto da propriedade é 'user' em vez de 'username'
    password: process.env.PASS
})

module.exports = database;
