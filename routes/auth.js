const express = require("express");
const session = require("express-session");
const fileUpload = require('express-fileupload');

const bodyParser = require("body-parser");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const GoogleStrategy = require("passport-google-oauth2"); // sper sa mearga
const bcrypt = require("bcrypt");
const pool = require("../database/postgres.database");

const getUsersCommand = "WITH q2_users AS ( \
  WITH q_users AS( \
  SELECT user_id, email, full_name, nickname, profile_picture_id, background_picture_id, user_password FROM users \
  ) SELECT qu.*, i.location as pfp_location FROM q_users qu \
  JOIN images i  \
  ON i.image_id = qu.profile_picture_id \
  ) SELECT qu2.*, i.location as bg_location FROM q2_users qu2 \
  JOIN images i \
  on i.image_id = qu2.background_picture_id ";

/*
* Middleware & Setup
*/
const router = express.Router();
const saltRounds = 10;

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));
router.use(session({
  secret: "VERY_SECRET_KEY",
  resave: false,
  saveUninitialized: true,
  // cookie: {
  //   secure: false, //<-- Setarea true necesita HTTPS
  //   maxAge: 1000 * 60 * 60 * 24 * 30, //<-- 30 de zile
  // },
}));
router.use(passport.initialize());
router.use(passport.session());
// router.use(passport.authenticate("session"));
// router.use(cors({ origin: "http://localhost:3000" }));
router.use(fileUpload({
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB
    files: 1
  }
}));
/*
 * Implementarea strategiilor
 */
const passwordStrategy = new LocalStrategy(async function verify(username, password, cb) {
  // console.log("Informatii Debug functie `passwordStrategy`");
  // console.log("username: ", username);
  // console.log("password: ", password);
  try {
    // const result = await pool.query("SELECT * FROM users WHERE email = $1", [username]);
    const { getUserInfoByEmailWithPassword } = require("../utils/sql_commands");

    const user_result = await pool.query(getUserInfoByEmailWithPassword, [username]);

    if (result.rows.length === 0) {
      return cb(null, false, { message: "Utilizatorul nu exista" });
    }

    const saved_reviews_result = await pool.query(getReviewIdsSavedByUser, [user_result[0]?.user_id]);

    const user = {
      ...user_result.rows[0],
      saved_reviews: saved_reviews_result.rows.map(review => review.review_id)
    };

    bcrypt.compare(password, user.password_hash, function (err, valid) {
      if (err) {
        return cb(err);
      }

      if (valid) {
        return cb(null, user);
      } else {
        return cb(null, false);//, { message: "Parola incorecta" });
      }
    });

  } catch (error) {
    return cb(error); // eroare de la baza de date
  }
});

const googleStragegy = new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "localhost:3000/main", // <-- DE COMPLETAT
  userProfileURL: "localhost:3000/profil"
}, async function (accessToken, refreshToken, profile, cb) {
  console.log("Informatii Debug functie `googleStrategy`");
  console.log("utilizatorul autentificat: ", profile);

  const command = "user_id, email, full_name, nickname, profile_picture_id, background_picture_id FROM users WHERE email = $1";

  try {
    var result = await pool.query(command, [profile.email]);

    if (result.rows.length > 0) {
      // Utilizatorul exista
      return cb(null, result.rows[0]);
    }

    // Utilizatorul nu exista
    // TO DO: POZA DE PROFIL
    const insert_command_profile_picture = "INSERT INTO images (image_category, location) VALUES ($1, $2) RETURNING image_id";
    const insert_command_user = "INSERT INTO users (email, nickname, full_name, user_password) VALUES ($1, $2, $3, $4) RETURNING user_id";

    var result = await pool.query(insert_command_user, [profile.email, profile.displayName.toLowerCase().replaceAll(" ", "-"), profile.displayName, null]);
    return cb(null, result.rows[0]);
  } catch (error) {
    return cb(error);
  }
});

/*
 * Configurarea strategiilor
 */
passport.use("local", passwordStrategy);

/*
 * Rute
 */
router.route("/status").get(function (req, res) {
  if (req.isAuthenticated()) {
    res.send(req.user);
  } else {
    res.status(401).json({ message: "Utilizatorul nu este autentificat" });
  }
});

router.route("/login").get(function (req, res) {
  res.json({
    message: "Aceasta este pagina de login",
  });
});

router.route("/login/password")
  .get(function (req, res) {
    res.json({
      message: "Aceasta este pagina de login cu parola",
    });
  })
  // .post(function (req, res, next) {
  //   console.log(req.body);
  //   res.json({ mesaj: "Receptionat!" , request: req.body});
  //   next();
  // })
  .post(passport.authenticate("local",
    // {
    //   // successRedirect: "password/success", // <-- de schimbat
    //   // failureRedirect: "password/error",   // <-- de schimbat
    //   successRedirect: "http://localhost:3000/main",
    //   failureRedirect: "http://localhost:3000/login",
    // }
  ), function (req, res) {
    console.log("Un utilizator a fost logat cu succes!");
    console.log(req.user);
    res.send(req.user);
  });
// .post(passport.authenticate("local"), function (req, res) {
//   res.send(req.user);
// });

router.route("/login/password/success").get(function (req, res) {
  res.json({
    message: "Logarea cu email si parola a avut succes",
  });
});

router.route("/login/password/error").get(function (req, res) {
  res.json({
    message: "Logarea cu email si parola a esuat",
  });
});

router.route("/login/google")
  .post(passport.authenticate("google"), function (req, res) {
    console.log("Un utilizator a fost logat cu succes folosind Google!");
    console.log(req.user);
    res.send(req.user);
  });

router.route("/register").get(function (req, res) {
  res.json({
    message: "Aceasta este pagina de inregistrare",
  });
});

router.route("/register/password")
  .get(function (req, res) {
    res.json({
      message: "Aceasta este pagina de inregistrare cu parola",
    })
  })
  // .post(async function (req, res) {
  //   res.json({ mesaj: "Receptionat!" , request: req.body });
  // });
  .post(async function (req, res) {
    const email = req.body.email;
    const nickname = req.body.nickname;
    const full_name = req.body.full_name;
    const password = req.body.password;
    //res.json({ body: req.body, files: req.files || "No files" });
    //res.json({dirname: __dirname});
    if (!email || !nickname || !full_name || !password) {
      return res.status(400).json({ message: "Completati toate campurile" });
    }


    var profile_picture_id = 56; // MAGIC NUMBER: 56 este id-ul unei poze default
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
      const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

      if (result.rows.length > 0) {
        return res.status(400).json({ message: "Email-ul exista deja" });
      }

      bcrypt.hash(password, saltRounds, async function (err, hash) {
        if (err) {
          return res.status(500).json({ message: err.message });
        }

        try {
          const result = await pool.query("INSERT INTO users (email, nickname, full_name, user_password, profile_picture_id) VALUES ($1, $2, $3, $4, $5) RETURNING user_id", [email, nickname, full_name, hash, profile_picture_id]);
          const user_id = result.rows[0].user_id;

          return res.redirect("http://localhost:3000/login");
          // return res.status(201).json({ message: "Utilizatorul a fost creat" });
        } catch (error) {
          return res.status(500).json({ message: error.message });
        }
      });

    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  });

router.route("/logout")
  //   .get(function (req, res) {
  //     res.json({ mesaj: "Aceasta este pagina de logout" });
  //   })
  .get(function (req, res, next) { // <-- NU ESTE BEST PRACTICE !!!
    req.logout(function (err) {
      if (err) return next(err);
      console.log("Un utilizator a fost delogat cu succes!")
      res.redirect("http://localhost:3000/");
    });
  });

router.route("/myprofile")
  .get(function (req, res) {
    if (req.isAuthenticated()) {
      console.log("Un utilizator a accesat pagina de profil");
      console.log(req.session.passport.user);
      res.json(req.session.passport.user);
      // res.status(200).json({
      //   message: "You are authenticated",
      // })
    } else {
      console.log("Un utilizator a incercat sa acceseze pagina de profil fara a fi autentificat");
      res.status(401).json({
        message: "You are not authenticated",
      })
    }
  });

router.route("/profile/:user_id");

/*
 * Serializare si deserializare utilizator
 */
// passport.serializeUser((user, cb) => {
//   cb(null, user);
// });
// passport.deserializeUser((user, cb) => {
//   cb(null, user);
// });

passport.serializeUser((user, cb) => {
  cb(null, user.user_id); // Store user_id in the session
});

passport.deserializeUser(async (id, cb) => {
  const { getUserInfoById, getReviewIdsSavedByUser } = require("../utils/sql_commands");

  try {
    const user_result = await pool.query(getUserInfoById, [id]);
    const saved_reviews_result = await pool.query(getReviewIdsSavedByUser, [id]);

    if (result.rows.length === 0) {
      return cb(new Error('User not found'));
    }

    const user = {
      ...user_result.rows[0],
      saved_reviews: saved_reviews_result.rows.map(review => review.review_id)
    };

    cb(null, user); // Fetch full user details
  } catch (err) {
    cb(err);
  }
});

module.exports = router;