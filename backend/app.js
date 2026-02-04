const express = require('express');
const app = express();

// global middleware
app.use(express.json());

// ROUTES get mounted here 👇
app.use('/api/dashboard', require('./routes/dashboard/routes'));
app.use('/api/users', require('./routes/users/routes'));
app.use('/api/auth', require('./routes/auth/routes'));

module.exports = app;
