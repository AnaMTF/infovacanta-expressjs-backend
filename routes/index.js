const express = require("express");
// const path = require("path");
const pool = require("../database/postgres.database");
const bodyParser = require("body-parser");
const router = express.Router();

// router.use(cors({ origin: "http://localhost:3000" }));
// router.use(bodyParser.json());
// router.use(bodyParser.urlencoded({ extended: true }));

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
  })
  .put(async function (req, res) {
    console.log(req.body);
    const command = "UPDATE reviews SET review_body = $1, rating = $2, review_picture_id = $3 WHERE review_id = $4";

    try {
      await pool.query(command, [req.body.review_body, req.body.rating, req.body.review_picture_id, req.params.review_id]);
      res.status(200).json({ message: "Review-ul a fost actualizat" });
    } catch (error) {
      res.status(500).json(error);
    }
  })
  .delete(async function (req, res) {
    try {
      await pool.query("DELETE FROM reviews WHERE review_id = $1", [req.params.review_id]);
      res
    } catch (error) {
      res.status(500).json(error);
    }
  });

router.route("/reviews/:reviewId/comments")
  .get(function (req, res) {
    res.status(404).send("Not implemented");
  })
  .post(async function (req, res) {
    console.log(req.body);
    try {
      await pool.query("INSERT INTO comments (content, author_id, review_id) VALUES ($1, $2, $3)", [req.body.content, req.body.author_id, req.params.reviewId]);
      res.status(201).json({ message: "Comentariul a fost adăugat" });
    } catch (error) {
      res.status(500).json(error);
    }
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
    // console.log(req.passport.session || "No session");

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