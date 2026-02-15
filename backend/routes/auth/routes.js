const express = require('express');
const db = require('../../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const authRouter = express.Router();
require('dotenv').config();

authRouter.get('/', async (req, res) => { 
    res.json({"message":"This is the general auth section"});
});

authRouter.post('/register', async (req, res) => {
  console.log("Endpoint to register is hit");
  try {
    const { firstname, lastname, email, password } = req.body;
    
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash( password, salt);

    // TODO: Hash password with bcrypt before storing
    const query = 'INSERT INTO users (first_name,last_name, email, password_hash) VALUES (?, ?, ?, ?)';
    const [results] = await db.query(query, [firstname,lastname, email, hashedPassword]);
    console.log("The results are >>>", results);


    res.status(201).json({ message: 'User registered', userId: results.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    console.error('Error creating user:', error);
    res.status(500).json({ error: error.message });
  }
});

authRouter.post('/login', async (req,res) => {
  try{
    const {email,password} = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    //I have to query the database of users
    const query = 'SELECT * from users where deleted_at is null';
    const [results] = await db.query(query);
    console.log("The total list of users >>>", results);
    const user = results.find( item => item.email === req.body.email);
    console.log("The found user is >>>", user);

    if(!user){
      return res.status(400).json({ error: 'Cannot Find User' });
    }
    console.log("req.body:", req.body);


    const isSame = await bcrypt.compare(req.body.password, user.password_hash);

    if(isSame){

      // here is where i create the json web token
     const accessToken = jwt.sign(user, process.env.JWT_SECRET);
     res.json({accessToken: accessToken})

    }
    else{
      res.send('Incorrect Password');
    }

  }catch(error){
    res.status(500).json({ error: error.message })
  }
});

module.exports = authRouter;