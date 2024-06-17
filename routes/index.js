const express = require("express");
// const path = require("path");
const pool = require("../database/postgres.database");
const bodyParser = require("body-parser");
const router = express.Router();

// router.use(cors({ origin: "http://localhost:3000" }));
// router.use(bodyParser.json());
// router.use(bodyParser.urlencoded({ extended: true }));

const getReviewsCommand = "SELECT * FROM reviews \
    JOIN destinations \
    ON reviews.destination_id = destinations.destination_id \
    JOIN (SELECT user_id, email, full_name, nickname, profile_picture_id, background_picture_id FROM users) as user_query \
    ON reviews.author_id = user_query.user_id \
    JOIN (select review_id, count(comment_id) as number_of_comments from comments group by review_id) as comm_query \
    ON reviews.review_id = comm_query.review_id";

const getDestinationsCommand = "WITH processed_destinations AS ( \
    SELECT \
        destination_id, \
        destination_name, \
        destination_category, \
        coordinates, \
        destination_picture_id, \
        description, \
        replace(lower(unaccent(destination_name)), ' ', '-') as destination_link \
    FROM \
        destinations \
) \
SELECT \
    pd.destination_id, \
    pd.destination_name, \
    pd.destination_category, \
    pd.coordinates, \
    pd.destination_picture_id, \
    pd.description, \
    pd.destination_link, \
    i.* \
FROM \
    processed_destinations pd \
JOIN \
    images i ON pd.destination_picture_id = i.image_id";


const getUsersCommand = "WITH q_users AS ( \
	SELECT user_id, email, full_name, nickname, profile_picture_id, background_picture_id FROM users \
) SELECT qu.*, i.location as pfp_location FROM q_users qu \
JOIN images i \
ON i.image_id = qu.profile_picture_id";
/*
 * Rute
 */
router.route("/reviews")
  .get(async function (req, res) {
    try {
      const result = await pool.query(getReviewsCommand);
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json(error);
    }
  })
  .post(async function (req, res) {
    res.status(201).json({ message: "Recenzia a fost adăugată" });
  });

router.route("/reviews/:reviewId")
  .get(async function (req, res) {
    try {
      const result = await pool.query(getReviewsCommand + " WHERE reviews.review_id = $1", [req.params.reviewId]);
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
  .get(async function (req, res) {
    try {
      const result = await pool.query("SELECT * FROM comments JOIN (SELECT user_id, nickname FROM users) as users_info ON comments.author_id = users_info.user_id WHERE review_id = $1", [req.params.reviewId]);
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json(error);
    }
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
    // command = "SELECT user_id, email, full_name, nickname, profile_picture_id, background_picture_id FROM users";

    try {
      const result = await pool.query(getUsersCommand);
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json(error);
    }
  });

router.route("/users/:userId")
  .get(async function (req, res) {
    //const command = "SELECT user_id, email, full_name, nickname, profile_picture_id, background_picture_id FROM users WHERE user_id = $1";

    try {
      const result = await pool.query(getUsersCommand + " WHERE user_id = $1", [req.params.userId]);
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json(error);
    }
  });

router.route("/users/:userId/reviews")
  .get(async function (req, res) {
    try {
      const result = await pool.query(getReviewsCommand + " WHERE user_id = $1", [req.params.userId]);
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json(error);
    }
  });

router.route("/users/:userId/reviews/:reviewId")
  .get(async function (req, res) {
    try {
      const result = await pool.query(getReviewsCommand + " WHERE user_id = $1 AND reviews.review_id = $2", [req.params.userId, req.params.reviewId]);
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json(error);
    }
  });

router.route("/users/:userId/reviews/:reviewId/comments")
  .get(async function (req, res) {
    try {
      const result = await pool.query("SELECT * FROM comments JOIN (SELECT user_id, nickname FROM users) as users_info ON comments.author_id = users_info.user_id WHERE review_id = $1 AND author_id = $2", [req.params.reviewId, req.params.userId]);
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json(error);
    }
  });

router.route("/destinations")
  .get(async function (req, res) {
    // console.log(req.passport.session || "No session");

    try {
      const result = await pool.query(getDestinationsCommand);
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json(error);
    }
  });

router.route("/destinations/:destinationId")
  .get(async function (req, res) {
    try {
      //const result = await pool.query("SELECT * FROM destinations JOIN images ON destinations.destination_picture_id = images.image_id WHERE destination_id = $1", [req.params.destinationId]);
      const result = await pool.query(getDestinationsCommand + " WHERE pd.destination_id = $1", [req.params.destinationId]);
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json(error);
    }
  });

router.route("/destinations/:destinationId/reviews")
  .get(async function (req, res) {
    try {
      const result = await pool.query(getReviewsCommand + " WHERE destinations.destination_id = $1", [req.params.destinationId]);
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json(error);
    }
  });

router.route("/destinations/:destinationId/reviews/:reviewId")
  .get(async function (req, res) {
    try {
      const result = await pool.query(getReviewsCommand + " WHERE destinations.destination_id = $1 AND reviews.review_id = $2", [req.params.destinationId, req.params.reviewId]);
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json(error);
    }
  });

router.route("/images")
  .get(async function (req, res) {
    try {
      const result = await pool.query("SELECT * FROM images");
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json(error);
    }
  });

router.route("/images/:imageId")
  .get(async function (req, res) {
    let imageId = req.params.imageId;

    if (imageId === "null") {
      imageId = 57;
    }

    try {
      const result = await pool.query("SELECT * FROM images WHERE image_id = $1", [imageId]);
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json(error);
    }
  });

router.route("/query")
  .get(async function (req, res) {
    const command_reviews = "SELECT * FROM reviews JOIN destinations ON reviews.destination_id = destinations.destination_id JOIN (SELECT user_id, email, full_name, nickname, profile_picture_id, background_picture_id FROM users) as user_query ON reviews.author_id = user_query.user_id WHERE LOWER(review_body) LIKE '%' || LOWER($1) || '%'";
    const command_destinations = getDestinationsCommand + " WHERE LOWER(destination_name) LIKE '%' || LOWER($1) || '%' OR LOWER(description) LIKE '%' || LOWER($1) || '%' OR destination_category::TEXT LIKE '%' || LOWER($1) || '%'";
    const command_users = "SELECT user_id, email, full_name, nickname, profile_picture_id, background_picture_id FROM users WHERE LOWER(full_name) LIKE '%' || LOWER($1) || '%' OR LOWER(nickname) LIKE '%' || LOWER($1) || '%'";
    const command_comments = "SELECT * FROM comments JOIN (SELECT user_id, nickname FROM users) as users_info ON comments.author_id = users_info.user_id WHERE LOWER(content) LIKE '%' || LOWER($1) || '%'";

    try {
      const result_reviews = await pool.query(command_reviews, [req.body.keyword]);
      const result_destinations = await pool.query(command_destinations, [req.body.keyword]);
      const result_users = await pool.query(command_users, [req.body.keyword]);
      const result_comments = await pool.query(command_comments, [req.body.keyword]);

      const result = {
        reviews: result_reviews.rows,
        destinations: result_destinations.rows,
        users: result_users.rows,
        comments: result_comments.rows
      };

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json(error);
    }
  });

router.route("/query/destinations/:destinationLink")
  .get(async function (req, res) {
    try {
      const result = await pool.query(getDestinationsCommand + " WHERE pd.destination_link = $1", [req.params.destinationLink]);
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json(error);
    }
  });

router.route("/query/:keyword")
  .get(async function (req, res) {
    const command_reviews = "SELECT * FROM reviews JOIN destinations ON reviews.destination_id = destinations.destination_id JOIN (SELECT user_id, email, full_name, nickname, profile_picture_id, background_picture_id FROM users) as user_query ON reviews.author_id = user_query.user_id WHERE LOWER(review_body) LIKE '%' || LOWER($1) || '%'";
    const command_destinations = getDestinationsCommand + " WHERE LOWER(destination_name) LIKE '%' || LOWER($1) || '%' OR LOWER(description) LIKE '%' || LOWER($1) || '%' OR destination_category::TEXT LIKE '%' || LOWER($1) || '%'";
    const command_users = getUsersCommand + " WHERE LOWER(full_name) LIKE '%' || LOWER($1) || '%' OR LOWER(nickname) LIKE '%' || LOWER($1) || '%'";
    const command_comments = "SELECT * FROM comments JOIN (SELECT user_id, nickname FROM users) as users_info ON comments.author_id = users_info.user_id WHERE LOWER(content) LIKE '%' || LOWER($1) || '%'";

    try {
      const result_reviews = await pool.query(command_reviews, [req.params.keyword]);
      const result_destinations = await pool.query(command_destinations, [req.params.keyword]);
      const result_users = await pool.query(command_users, [req.params.keyword]);
      const result_comments = await pool.query(command_comments, [req.params.keyword]);

      const result = {
        reviews: result_reviews.rows,
        destinations: result_destinations.rows,
        users: result_users.rows,
        comments: result_comments.rows
      };

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json(error);
    }
  });

router.route("/query/users/:userId/statistics")
  .get(async function (req, res) {
    const command = "SELECT r.author_id, \
    COUNT(r.review_id) AS num_reviews, \
      q.num_comments \
FROM reviews r \
    JOIN( \
      SELECT author_id, COUNT(comment_id) AS num_comments \
    FROM comments \
    GROUP BY author_id\
    ) AS q \
ON r.author_id = q.author_id \
WHERE r.author_id = $1 \
GROUP BY r.author_id, q.num_comments";

    try {
      const result = await pool.query(command, [req.params.userId]);
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json(error);
    }
  });

router.route("/query/reviews/max")
  .get(async function (req, res) {
    const command = "SELECT max(review_id) FROM reviews";

    try {
      const result = await pool.query(command);
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json(error);
    }
  });

module.exports = router;