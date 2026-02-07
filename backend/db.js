const mysql = require("mysql2");


console.log("The host value >>>", process.env.DB_HOST);
console.log("The user value >>>", process.env.DB_USER);
console.log("The PASSWORD value >>>", process.env.DB_PASSWORD);
console.log("The DATABASE NAME value >>>", process.env.DB_NAME);
// const connection = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
// });
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});
// connection.connect(err => {
//   if (err) {
//     console.error("❌ DB connection failed:", err);
//     process.exit(1);
//   }
//   console.log("✅ Connected to MySQL");
// });

const promisePool = pool.promise();

async function waitForDb(retries = 10, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      await promisePool.query('SELECT 1');
      console.log('✅ Connected to MySQL');
      return;
    } catch (err) {
      console.error(`DB connect attempt ${i + 1} failed:`, err.message);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  console.error('🔥 Could not connect to MySQL after retries.');
  process.exit(1);
}

waitForDb();

module.exports = promisePool;

//module.exports = connection;
