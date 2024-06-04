const postgres = require('pg');
const dotenv = require('dotenv');
dotenv.config();

//console.log(process.env);

const pool = new postgres.Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
    max: process.env.MAX_CLIENTS
});

pool.connect();

module.exports = pool;