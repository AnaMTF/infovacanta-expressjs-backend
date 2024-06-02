const postgres = require('pg');

const pool = new postgres.Pool({
    user: "postgres",
    host: "localhost",
    database: "infovacanta2",
    password: "3001",
    port: 5432,
    max: 250
});

pool.connect();

module.exports = pool;