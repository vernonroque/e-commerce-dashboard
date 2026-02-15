//this file is to hold the top view routes
const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors'); // Import the cors package
const jwt = require('jsonwebtoken');


// global middleware
app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Enable CORS
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//   if (req.method === 'OPTIONS') {
//     return res.sendStatus(200);
//   }
//   next();
// });

function authenticateToken(req,res,next){
    const authHeader = req.headers['authentication'];
    const token = authHeader && authHeader.split(' ')[1];
    if(!token) return res.sendStatus(401);

    jwt.verify(token,process.env.JWT_SECRET, (err,user) => {
        if(err) return res.status(403).send('there is an error');
        req.user = user;
        next();
    });
}

// ROUTES get mounted here 👇
app.use('/api/dashboard', authenticateToken, require('./routes/dashboard/routes'));
app.use('/api/users', require('./routes/users/routes'));
app.use('/api/auth', require('./routes/auth/routes'));

module.exports = app;
