const express = require("express");
const session = require("express-session");
const fileUpload = require('express-fileupload');

const bodyParser = require("body-parser");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const pool = require("../database/postgres.database");

/*
* Middleware & Setup
*/
const router = express.Router();
const saltRounds = 10;

passport.initialize();
router.use(session({
  secret: "VERY_SECRET_KEY",
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, //<-- Setarea true necesita HTTPS
    maxAge: 1000 * 60 * 60 * 24 * 30, //<-- 30 de zile
  },
}));
router.use(passport.authenticate("session"));
// router.use(cors({ origin: "http://localhost:3000" }));
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(fileUpload());
/*
 * Implementarea strategiilor
 */
const passwordStrategy = new LocalStrategy(async function verify(username, password, cb) {
  // console.log("Informatii Debug functie `passwordStrategy`");
  // console.log("username: ", username);
  // console.log("password: ", password);
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [username]);
    if (result.rows.length === 0) {
      return cb(null, false, { message: "Utilizatorul nu exista" });
    }
    const user = result.rows[0];

    // const match = await bcrypt.compare(password, user.user_password);
    // if (match) {
    //   return cb(null, user);
    // } else {
    //   return cb(null, false, { message: "Parola incorecta" });
    // }

    bcrypt.compare(password, user.user_password, function (err, valid) {
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
  .post(passport.authenticate("local", {
    // successRedirect: "password/success", // <-- de schimbat
    // failureRedirect: "password/error",   // <-- de schimbat
    successRedirect: "http://localhost:3000/main",
    failureRedirect: "http://localhost:3000/login",
  }));
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

    let profile_picture_id = null;
    let profile_picture = null;
    let profile_picture_path = null;
    if (req.files) {
      profile_picture = req.files.profile_picture;
      profile_picture_path = __dirname + "\\..\\public\\images\\profile_pictures\\" + profile_picture.name;
      profile_picture_path_relative = "http://localhost:5000/" + profile_picture.name;
      try {
        profile_picture.mv(profile_picture_path);
        const result = await pool.query("INSERT INTO images (image_category, location) VALUES ($1, $2) RETURNING image_id", ["profile", profile_picture_path_relative]);
        profile_picture_id = result.rows[0].image_id;
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
          const result = await pool.query("INSERT INTO users (email, nickname, full_name, user_password) VALUES ($1, $2, $3, $4) RETURNING user_id", [email, nickname, full_name, hash]);
          const user_id = result.rows[0].user_id;

          // console.log("profile_picture_path: ", profile_picture_path);
          // console.log("user_id: ", user_id);

          if (profile_picture_path) {
            await pool.query("UPDATE users SET profile_picture_id = $1 WHERE user_id = $2", [profile_picture_id, user_id]);
          }

          return res.status(201).json({ message: "Utilizatorul a fost creat" });
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

/*
 * Serializare si deserializare utilizator
 */
passport.serializeUser((user, cb) => {
  cb(null, user);
});
passport.deserializeUser((user, cb) => {
  cb(null, user);
});

module.exports = router;