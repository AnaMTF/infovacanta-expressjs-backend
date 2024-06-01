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
const cors = require("cors");

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

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public/images")));
app.use(morgan("dev"));
app.use(cors());
pool.connect();

/*
 * Rutele aplicatiei 
 */

app.route("/reviews")
  .get(async function (req, res) {
    try {
      const result = await pool.query("SELECT * FROM reviews JOIN destinations ON reviews.destination_id = destinations.destination_id JOIN users ON reviews.author_id = users.user_id");
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json(error);
    }
  });

app.route("/reviews/:reviewId")
  .get(async function (req, res) {
    try {
      const result = await pool.query("SELECT * FROM reviews JOIN destinations ON reviews.destination_id = destinations.destination_id JOIN users ON reviews.author_id = users.user_id WHERE review_id = $1", [req.params.reviewId]);
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json(error);
    }
  });

app.route("/reviews/:reviewId/comments")
  .get(function (req, res) {
    res.status(404).send("Not implemented");
  });

app.route("/users")
  .get(async function (req, res) {
    command = "SELECT user_id, email, full_name, nickname, profile_picture_id, background_picture_id FROM users";

    try {
      const result = await pool.query(command);
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json(error);
    }
  });

app.route("/users/:userId")
  .get(async function (req, res) {
    const command = "SELECT user_id, email, full_name, nickname, profile_picture_id, background_picture_id FROM users WHERE user_id = $1";

    try {
      const result = await pool.query(command, [req.params.userId]);
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json(error);
    }
  });

app.route("/users/:userId/reviews")
  .get(async function (req, res) {
    try {
      const result = await pool.query("SELECT * FROM reviews JOIN destinations ON reviews.destination_id = destinations.destination_id JOIN users ON reviews.author_id = users.user_id WHERE user_id = $1", [req.params.userId]);
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json(error);
    }
  });

app.route("/users/:userId/reviews/:reviewId")
  .get(async function (req, res) {
    try {
      const result = await pool.query("SELECT * FROM reviews JOIN destinations ON reviews.destination_id = destinations.destination_id JOIN users ON reviews.author_id = users.user_id WHERE user_id = $1 AND review_id = $2", [req.params.userId, req.params.reviewId]);
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json(error);
    }
  });

app.route("/users/:userId/reviews/:reviewId/comments")
  .get(function (req, res) {
    res.status(404).send("Not implemented");
  });

app.route("/destinations")
  .get(async function (req, res) {
    try {
      const result = await pool.query("SELECT * FROM destinations JOIN images ON destinations.destination_picture_id = images.image_id");
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json(error);
    }
  });

app.route("/destinations/:destinationId")
  .get(async function (req, res) {
    try {
      const result = await pool.query("SELECT * FROM destinations JOIN images ON destinations.destination_picture_id = images.image_id WHERE destination_id = $1", [req.params.destinationId]);
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json(error);
    }
  });

app.route("/destinations/:destinationId/reviews")
  .get(async function (req, res) {
    try {
      const result = await pool.query("SELECT * FROM reviews JOIN destinations ON reviews.destination_id = destinations.destination_id JOIN users ON reviews.author_id = users.user_id WHERE destination_id = $1", [req.params.destinationId]);
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json(error);
    }
  });

app.route("/destinations/:destinationId/reviews/:reviewId")
  .get(async function (req, res) {
    try {
      const result = await pool.query("SELECT * FROM reviews JOIN destinations ON reviews.destination_id = destinations.destination_id JOIN users ON reviews.author_id = users.user_id WHERE destination_id = $1 AND review_id = $2", [req.params.destinationId, req.params.reviewId]);
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json(error);
    }
  });

/*
 * Pornirea aplicatiei
 */

app.listen(port, function () {
  console.log(`Server is running on port ${port}`);
});