//this file is mainly used to connect and initialize the db server

const mysql = require("mysql2");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

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
