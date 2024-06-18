const express = require("express");
const fileUpload = require('express-fileupload');

// const path = require("path");
const pool = require("../database/postgres.database");
const bodyParser = require("body-parser");
const router = express.Router();
const bcrypt = require("bcrypt");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(fileUpload());

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


const getUsersCommand = "WITH q2_users AS ( \
	WITH q_users AS( \
  SELECT user_id, email, full_name, nickname, profile_picture_id, background_picture_id FROM users \
  ) SELECT qu.*, i.location as pfp_location FROM q_users qu \
  JOIN images i  \
  ON i.image_id = qu.profile_picture_id \
  ) SELECT qu2.*, i.location as bg_location FROM q2_users qu2 \
  JOIN images i \
  on i.image_id = qu2.background_picture_id ";
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
    // const destinationname = req.body.destinationname;
    // const reviewbody = req.body.reviewbody;

    // const authornickname = req.session.passport.user.nickname;
    try {
      var result = await pool.query(
        "SELECT destination_id, destination_category FROM destinations WHERE destination_name = $1",
        [req.body.destination_name]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ message: "Destinatia nu exista" });
      }

      const destination_id = result.rows[0].destination_id;
      const destination_category = result.rows[0].destination_category;

      var result = await pool.query(
        "INSERT INTO reviews (author_id, review_category, review_body, date_posted, destination_id) \
            VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [req.body.author_id, destination_category, req.body.review_body, req.body.date_posted, destination_id]
      );

      res.status(201); // HTTP STATUS 201: Created

    } catch (err) {
      res.status(500).json(err);
    }
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
  });
// .post(async function (req, res) {
//   console.log(req.body);
//   try {
//     await pool.query("INSERT INTO comments (content, author_id, review_id) VALUES ($1, $2, $3)", [req.body.content, req.body.author_id, req.params.reviewId]);
//     res.status(201).json({ message: "Comentariul a fost adăugat" });
//   } catch (error) {
//     res.status(500).json(error);
//   }
// });

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
  })
  .post(async function (req, res) {
    console.log(req.body);

    var profile_picture_id = null;

    if (req.files?.profile_picture) {
      console.log("Am primit o poza de profil");
      try {
        profile_picture_id = await pool.query("INSERT INTO images (image_category, location) VALUES ($1, $2) RETURNING image_id", ["profile", "http://localhost:5000/" + req.files.profile_picture.name]);
        profile_picture_id = profile_picture_id.rows[0].image_id;
        req.files.profile_picture.mv(__dirname + "\\..\\public\\images\\profile_pictures\\" + req.files.profile_picture.name);
      } catch (error) {
        console.log(error.message);
      }
    }

    try {
      if (profile_picture_id) {
        await pool.query("UPDATE users SET profile_picture_id = $1 WHERE user_id = $2", [profile_picture_id, req.params.userId]);
      }

      await pool.query("UPDATE users SET email = $1, full_name = $2, nickname = $3 WHERE user_id = $4", [req.body.email, req.body.full_name, req.body.nickname, req.params.userId]);
      res.redirect("http://localhost:3000/profil");
    } catch (error) {
      console.log(error.message);
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

    if (imageId === "null" || imageId === "undefined") {
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

router.route("/comments-api")
  .post(async function (req, res) {
    console.log(req.body);
    // res.status(201).json(req.body);

    try {
      await pool.query("INSERT INTO comments (content, author_id, review_id) VALUES ($1, $2, $3)", [req.body.content, req.body.author_id, req.body.review_id]);
    } catch (error) {
      console.error(error);
      res.status(500).json(error);
    }
  });

router.route("/save-review")
  .get(async function (req, res) {
    try {
      const result = await pool.query("SELECT * FROM saved_reviews");
      res.status(200).json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json(error);
    }
  })
  .post(async function (req, res) {
    console.log(req.body);

    try {

      await pool.query("INSERT INTO saved_reviews (user_id, review_id) VALUES ($1, $2)", [req.body.user_id, req.body.review_id]);
      res.status(201);
    } catch (error) {
      console.error(error);
      res.status(500).json(error);
    }
  })
  .delete(async function (req, res) {
    console.log(req.body);

    try {

      await pool.query("DELETE FROM saved_reviews WHERE user_id = $1 AND review_id = $2", [req.body.user_id, req.body.review_id]);
      res.status(204); // HTTP STATUS 204: No Content
    } catch (error) {
      console.error(error);
      res.status(500).json(error);
    }

  });

router.route("/change-password")
  .get(async function (req, res) {
    res.status(200).json({ message: "GET request received" });
  })
  .post(async function (req, res) {
    console.log(req.body);
    // res.status(201).json(req.body);
    // res.status(200).json(req.body);

    try {

      const result = await pool.query("SELECT user_password FROM users WHERE user_id = $1", [req.body.user_id]);
      const database_password_hash = result.rows[0].user_password;

      // console.log(database_password_hash);
      // res.json(database_password_hash);

      // console.log(result);
      // res.send(result);

      bcrypt.compare(req.body.old_password, database_password_hash, function (err, result) {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        }

        if (result) {
          bcrypt.hash(req.body.new_password, 10, async function (err, hash) {
            if (err) {
              console.log(err);
              res.status(500).json(err);
            }

            try {
              await pool.query("UPDATE users SET user_password = $1 WHERE user_id = $2", [hash, req.body.user_id]);
              console.log("Parola a fost schimbata");
              res.status(200);
            } catch (error) {
              console.error(error);
              res.status(500).json(error);
            }
          });

        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json(error);
    }
  });

module.exports = router;