const express = require("express");
const path = require("path");
const pool = require("../database/postgres.database");

var router = express.Router();

router.use(express.static(path.join(__dirname, "public")));
router.use(express.static(path.join(__dirname, "public/images")));

/*
 * Rute
 */
router.route("/reviews")
  .get(async function (req, res) {
    try {
      const result = await pool.query("SELECT * FROM reviews JOIN destinations ON reviews.destination_id = destinations.destination_id JOIN (SELECT user_id, email, full_name, nickname, profile_picture_id, background_picture_id FROM users) as user_query ON reviews.author_id = user_query.user_id");
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json(error);
    }
  });

router.route("/reviews/:reviewId")
  .get(async function (req, res) {
    try {
      const result = await pool.query("SELECT * FROM reviews JOIN destinations ON reviews.destination_id = destinations.destination_id JOIN (SELECT user_id, email, full_name, nickname, profile_picture_id, background_picture_id FROM users) as user_query ON reviews.author_id = user_query.user_id WHERE review_id = $1", [req.params.reviewId]);
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json(error);
    }
  });

router.route("/reviews/:reviewId/comments")
  .get(function (req, res) {
    res.status(404).send("Not implemented");
  });

router.route("/users")
  .get(async function (req, res) {
    command = "SELECT user_id, email, full_name, nickname, profile_picture_id, background_picture_id FROM users";

    try {
      const result = await pool.query(command);
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json(error);
    }
  });

router.route("/users/:userId")
  .get(async function (req, res) {
    const command = "SELECT user_id, email, full_name, nickname, profile_picture_id, background_picture_id FROM users WHERE user_id = $1";

    try {
      const result = await pool.query(command, [req.params.userId]);
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json(error);
    }
  });

router.route("/users/:userId/reviews")
  .get(async function (req, res) {
    try {
      const result = await pool.query("SELECT * FROM reviews JOIN destinations ON reviews.destination_id = destinations.destination_id JOIN (SELECT user_id, email, full_name, nickname, profile_picture_id, background_picture_id FROM users) as user_query ON reviews.author_id = user_query.user_id WHERE user_id = $1", [req.params.userId]);
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json(error);
    }
  });

router.route("/users/:userId/reviews/:reviewId")
  .get(async function (req, res) {
    try {
      const result = await pool.query("SELECT * FROM reviews JOIN destinations ON reviews.destination_id = destinations.destination_id JOIN (SELECT user_id, email, full_name, nickname, profile_picture_id, background_picture_id FROM users) as user_query ON reviews.author_id = user_query.user_id WHERE user_id = $1 AND review_id = $2", [req.params.userId, req.params.reviewId]);
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json(error);
    }
  });

router.route("/users/:userId/reviews/:reviewId/comments")
  .get(function (req, res) {
    res.status(404).send("Not implemented");
  });

router.route("/destinations")
  .get(async function (req, res) {
    try {
      const result = await pool.query("SELECT * FROM destinations JOIN images ON destinations.destination_picture_id = images.image_id");
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json(error);
    }
  });

router.route("/destinations/:destinationId")
  .get(async function (req, res) {
    try {
      const result = await pool.query("SELECT * FROM destinations JOIN images ON destinations.destination_picture_id = images.image_id WHERE destination_id = $1", [req.params.destinationId]);
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json(error);
    }
  });

router.route("/destinations/:destinationId/reviews")
  .get(async function (req, res) {
    try {
      const result = await pool.query("SELECT * FROM reviews JOIN destinations ON reviews.destination_id = destinations.destination_id JOIN (SELECT user_id, email, full_name, nickname, profile_picture_id, background_picture_id FROM users) as user_query ON reviews.author_id = user_query.user_id WHERE destinations.destination_id = $1", [req.params.destinationId]);
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json(error);
    }
  });

router.route("/destinations/:destinationId/reviews/:reviewId")
  .get(async function (req, res) {
    try {
      const result = await pool.query("SELECT * FROM reviews JOIN destinations ON reviews.destination_id = destinations.destination_id JOIN (SELECT user_id, email, full_name, nickname, profile_picture_id, background_picture_id FROM users) as user_query ON reviews.author_id = user_query.user_id WHERE destinations.destination_id = $1 AND review_id = $2", [req.params.destinationId, req.params.reviewId]);
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json(error);
    }
  });

module.exports = router;