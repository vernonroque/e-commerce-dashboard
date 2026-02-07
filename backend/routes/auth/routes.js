const express = require('express');
const db = require('../../db');
const authRouter = express.Router();

authRouter.get('/', async (req, res) => { 
    res.json({"message":"This is the general auth section"});
});

authRouter.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // TODO: Hash password with bcrypt before storing
    const query = 'INSERT INTO users (email, password_hash) VALUES (?, ?)';
    db.query(query, [email, password], (err, results) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'Email already exists' });
        }
        console.error('Error creating user:', err);
        return res.status(500).json({ error: 'Failed to register user' });
      }
      res.status(201).json({ message: 'User registered', userId: results.insertId });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = authRouter;