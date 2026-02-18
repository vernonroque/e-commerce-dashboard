const express = require('express');
const db = require('../../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require("crypto");
const authRouter = express.Router();
require('dotenv').config();

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

const isProduction = process.env.NODE_ENV === "production";
console.log("The isProduction boolean is >>>", isProduction);

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
    // console.log("The total list of users >>>", results);
    const user = results.find( item => item.email === req.body.email);
    console.log("The found user is >>>", user);

    if(!user){
      return res.status(400).json({ error: 'Cannot Find User' });
    }
    console.log("req.body:", req.body);


    const isSame = await bcrypt.compare(req.body.password, user.password_hash);

    if(isSame){

      // here is where i create the json web token
      const accessToken = jwt.sign({'id':user.id, 'email':user.email},
                          process.env.JWT_SECRET, 
                          { expiresIn: '15s' });

      // here is where i create the refresh token
      const refreshToken = jwt.sign(
                        { id: user.id },
                        process.env.REFRESH_SECRET,
                        { expiresIn: '7d' }
                      );

      // Hash before storing
      const refreshTokenHash = hashToken(refreshToken);
      
      await db.query(
        `INSERT INTO sessions (user_id, refresh_token_hash, expires_at)
        VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))`,
        [user.id, refreshTokenHash]
      );

      res.cookie('token', accessToken, {
        httpOnly: true,
        secure: isProduction, // only HTTPS in prod
        sameSite: isProduction ? "none" : "lax",
        maxAge: 60 * 60 * 1000 // 1 hour
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProduction, // only HTTPS in prod
        sameSite: isProduction ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({ message: "Login successful" });

    }
    else{
      res.send('Incorrect Password');
    }

  }catch(error){
    res.status(500).json({ error: error.message })
  }
});

authRouter.post("/refresh", async (req, res) => {
  
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

    const hashed = hashToken(refreshToken);

    const [sessions] = await db.query(
      `SELECT * FROM sessions
       WHERE user_id = ? AND refresh_token_hash = ?`,
      [decoded.id, hashed]
    );

    if (!sessions.length) {
      // Possible reuse attack
      return res.sendStatus(403);
    }

    // 🧨 ROTATION: delete old session
    await db.query(
      `DELETE FROM sessions WHERE id = ?`,
      [sessions[0].id]
    );

    // Issue new tokens
    const newAccessToken = jwt.sign(
      { id: decoded.id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const newRefreshToken = jwt.sign(
      { id: decoded.id },
      process.env.REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    const newHash = hashToken(newRefreshToken);

    await db.query(
      `INSERT INTO sessions (user_id, refresh_token_hash, expires_at)
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))`,
      [decoded.id, newHash]
    );

    // Set new cookies
    res.cookie("token", newAccessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 15 * 60 * 1000
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({ success: true, ok: true });

  } catch (err) {
    console.log("There seems to be an error in refresh route >>>", err);
    return res.sendStatus(403);
  }
});

authRouter.post("/logout", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(204);

  const hashed = hashToken(refreshToken);

  await db.query(
    `DELETE FROM sessions WHERE refresh_token_hash = ?`,
    [hashed]
  );

  res.clearCookie("token");
  res.clearCookie("refreshToken");

  res.sendStatus(204);

});


module.exports = authRouter;