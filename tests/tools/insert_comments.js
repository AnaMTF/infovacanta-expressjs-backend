const postgres = require('pg');
const dotenv = require('dotenv');
dotenv.config();

// Unealta interna de introducere a unor comentarii in baza de date
// console.log(process.env);

const client = new postgres.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
  max: process.env.MAX_CLIENTS
});

pool.connect();

606, 747 // Range review_id
165, 291 // Range user_id

const comments = [
  "M-am simtit foarte bine in aceasta locatie, recomand cu incredere!",
  "Am avut parte de o experienta de neuitat, cu siguranta voi reveni!",
  "Mie nu mi-a placut deloc, nu recomand!",
  "Am fost foarte dezamagit de serviciile oferite, nu voi reveni!",
  "Imi place foarte mult aceasta locatie, am fost de nenumarate ori si voi reveni cu drag!",
  "Am fost placut surprins de aceasta locatie, cu siguranta voi reveni!"
];

async function insert_comment() {
  try {
    const command = "INSERT INTO comments (author_id, review_id, content) VALUES ($1, $2, $3)";
    for (let i = 606; i <= 747; i++) {
      for (let j = 165; j <= 291; j++) {
        for (let k = 0; k < 3; k++) {
          const comment_content = comments[Math.floor(Math.random() * comments.length)];
          console.log(`Inserted comment for review_id: ${i} and user_id: ${j}: ${comment_content}`);

          await pool.query(command, [j, i, comment_content]);
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
}

insert_comment();