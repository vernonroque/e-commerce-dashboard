const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors'); // Import the cors package

// global middleware
app.use(express.json());
app.use(cors()); 

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// ROUTES get mounted here 👇
app.use('/api/dashboard', require('./routes/dashboard/routes'));
app.use('/api/users', require('./routes/users/routes'));
app.use('/api/auth', require('./routes/auth/routes'));

module.exports = app;
