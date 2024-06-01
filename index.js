/* Anamaria-Florentina Titeche 2024
 * Serverul aplicatiei InfoVacanta.
 * Se ocupa de partea de backend a aplicatiei.
 * Sarcinile lui sunt de a autentifica utilizatorii si de a transmite date aplicatiei. 
 */

/*
 * Importuri
 */

const express = require("express");
const morgan = require("morgan");

const path = require("path");
const postgres = require("pg");

/*
 * Declaratii
 */

const app = express();
const port = 5000;

const pool = new postgres.Pool({
  user: "postgres",
  host: "localhost",
  database: "infovacanta2",
  password: "3001",
  port: 5432,
  max: 250
});

/*
 * Middleware & Setup
 */

app.use(express.static(path.join(__dirname, "pub                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       lic")));
app.use(morgan("dev"));
pool.connect();

/*
 * Rutele aplicatiei 
 */

app.get("/reviews", async function (req, res) {
  try {
    const result = await pool.query(command);
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.get("/reviews/:reviewId", async function (req, res) {
  try {
    const result = await pool.query("SELECT * FROM reviews WHERE review_id = $1", [req.params.reviewId]);
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.get("/reviews/:reviewId/comments", function (req, res) {
  res.status(404).send("Not implemented");
});

app.get("/users", async function (req, res) {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json(err);
  }
});

app.get("/users/:userId", async function (req, res) {
  try {
    const result = await pool.query("SELECT * FROM users WHERE user_id = $1", [req.params.userId]);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json(err);
  }
});

app.get("/users/:userId/reviews", async function (req, res) {
  try {
    const result = await pool.query("SELECT * FROM reviews WHERE user_id = $1", [req.params.userId]);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json(err);
  }
});

app.get("/users/:userId/reviews/:reviewId", async function (req, res) {
  try {
    const result = await pool.query("SELECT * FROM reviews WHERE user_id = $1 AND review_id = $2", [req.params.userId, req.params.reviewId]);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json(err);
  }
});

app.get("/users/:userId/reviews/:reviewId/comments", function (req, res) {
  res.status(404).send("Not implemented");
});

app.get("/destinations", async function (req, res) {
  try {
    const result = await pool.query("SELECT * FROM destinations");
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json(err);
  }
});

app.get("/destinations/:destinationId", async function (req, res) {
  try {
    const result = await pool.query("SELECT * FROM destinations WHERE destination_id = $1", [req.params.destinationId]);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json(err);
  }
});

app.get("/destinations/:destinationId/reviews", async function (req, res) {
  try {
    const result = await pool.query("SELECT * FROM reviews WHERE destination_id = $1", [req.params.destinationId]);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json(err);
  }
});

app.get("/destinations/:destinationId/reviews/comments", async function (req, res) {
  res.status(404).send("Not implemented");
});

/*
 * Pornirea aplicatiei
 */

app.listen(port, function () {
  console.log(`Server is running on port ${port}`);
});