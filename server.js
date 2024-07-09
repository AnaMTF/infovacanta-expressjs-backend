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
const https = require("https");
const fs = require("fs");
const session = require("express-session");

const path = require("path");
const bodyParser = require("body-parser");
const authRouter = require("./routes/auth");
const indexRouter = require("./routes/index");
const dotenv = require("dotenv");
dotenv.config();
/*
* Declaratii
*/

const app = express();
const port = process.env.PORT || 5000;

/*
* Middleware & Setup
*/
app.use(session({ secret: process.env.SESSION_SECRET }));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public/images")));
app.use(express.static(path.join(__dirname, "public/images/profile_pictures")));
app.use(express.static(path.join(__dirname, "public/images/background_pictures")));
app.use(morgan("common"));
app.use(cors({
  credentials: true,
  origin: process.env.CLIENT_URL
}));
app.use("/", indexRouter);
app.use("/auth", authRouter);
// app.use(cors({ origin: "http://localhost:3000" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

/*
 * Pornirea aplicatiei
 */
const options = {
  key: fs.readFileSync(path.join(__dirname, "certs", "localhost-key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "certs", "localhost.pem"))
};

const server = https.createServer(options, app);

server.listen(port, function () {
  console.log(`Server is running on port ${port}`);
});