const express = require("express");
const passport = require("passport");
const Strategy = require("passport-local");
const bcrypt = require("bcrypt");
const pool = require("../database/postgres.database");

const router = express.Router();
const saltRounds = 10;
passport.initialize();

/*
 * Implementarea strategiilor
 */
const passwordStrategy = new Strategy(async function verify(username, password, cb) {
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
passport.use("password", passwordStrategy);

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
  .post(passport.authenticate("password", {
    successRedirect: "password/success", // <-- de schimbat
    failureRedirect: "password/error",   // <-- de schimbat
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

module.exports = router;