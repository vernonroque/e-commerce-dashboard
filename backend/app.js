//this file is to hold the top view routes
const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors'); // Import the cors package
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');


// global middleware
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
console.log("frontend origin is >>>", FRONTEND_ORIGIN);
app.use(cors({
    origin: FRONTEND_ORIGIN , // your frontend origin (set via FRONTEND_ORIGIN)
    credentials: true
})); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


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
    // const authHeader = req.headers['authentication'];
    // const token = authHeader && authHeader.split(' ')[1];

    // console.log("This is the cookies object >>>", req.cookies);
    // console.log("I am in the authenticat token function >>>", req.cookies.token);
    const token = req.cookies.token;
    if(!token) return res.sendStatus(401);

    jwt.verify(token,process.env.JWT_SECRET, (err,user) => {
        if(err) {
            // TokenExpiredError => client should refresh
            console.log("The error object in jwt verify >>>", err);
            if(err.name === 'TokenExpiredError') return res.sendStatus(401);
            // Other errors (invalid sig, tampered) => security issue
            return res.status(403).send('there is an error');
        }
        req.user = user;
        next();
    });
}

// ROUTES get mounted here 👇
app.use('/api/dashboard', authenticateToken, require('./routes/dashboard/routes'));
app.use('/api/users', require('./routes/users/routes'));
app.use('/api/auth', require('./routes/auth/routes'));

module.exports = app;
