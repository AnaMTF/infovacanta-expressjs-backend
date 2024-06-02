const bcrypt = require("bcrypt");
const saltRounds = 10;

const radu_ionescu_plaintext = "papusica123";
const radu_ionescu_hash_database = "$2b$10$1OyBVLZmHy2qN7qD9g6Bsub1v0jysOVWlJ3oyzBr7ZIc.07.t93/e";

//const radu_ionescu_test_hash = bcrypt.hashSync(radu_ionescu_plaintext, saltRounds);
const match = bcrypt.compare(radu_ionescu_plaintext, radu_ionescu_hash_database);

if (match) {
  console.log("Parola este corecta");
} else {
  console.log("Parola este incorecta");
}