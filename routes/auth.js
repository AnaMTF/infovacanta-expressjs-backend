const express = require("express");
const session = require("express-session");

const bodyParser = require("body-parser");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const pool = require("../database/postgres.database");

const router = express.Router();
const saltRounds = 10;

/*
* Middleware & Setup
*/
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
router.use(bodyParser.urlencoded({ extended: true }));
/*
 * Implementarea strategiilor
 */
const passwordStrategy = new LocalStrategy(async function verify(username, password, cb) {
  console.log("Informatii Debug functie `passwordStrategy`")
  console.log("username: ", username);
  console.log("password: ", password);
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

    if (!email || !nickname || !full_name || !password) {
      return res.status(400).json({ message: "Completati toate campurile" });
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
          await pool.query("INSERT INTO users (email, nickname, full_name, user_password) VALUES ($1, $2, $3, $4)", [email, nickname, full_name, hash]);
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