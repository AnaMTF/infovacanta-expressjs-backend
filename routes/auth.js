const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const pool = require("../database/postgres.database");

const router = express.Router();

/*
 * Implementarea strategiilor
 */
const passwordStrategy = new LocalStrategy();

/*
 * Configurarea strategiilor
 */
passport.use("password", passwordStrategy)

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
  successRedirect: "login/password/success", // <-- de schimbat
  failureRedirect: "login/password/error",   // <-- de schimbat
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