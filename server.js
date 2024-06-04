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
const cors = require("cors");

const path = require("path");
const bodyParser = require("body-parser");
const authRouter = require("./routes/auth");
const indexRouter = require("./routes/index");

/*
* Declaratii
*/

const app = express();
const port = 5000;

/*
* Middleware & Setup
*/
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public/images")));
app.use(express.static(path.join(__dirname, "public/images/profile_pictures")));
app.use(morgan("dev"));
app.use(cors());
app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use(bodyParser.urlencoded({ extended: true }));

/*
 * Pornirea aplicatiei
 */
app.listen(port, function () {
  console.log(`Server is running on port ${port}`);
});