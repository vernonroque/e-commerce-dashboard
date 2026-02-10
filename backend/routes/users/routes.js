const express = require('express');
const db = require('../../db');
const usersRouter = express.Router();

usersRouter.get('/', async (req, res) => { 
  try {
    const query = 'SELECT id, email, created_at FROM users WHERE deleted_at IS NULL';
    const [results] = await db.query(query);
    res.json(results);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
});

usersRouter.get('/:id', async (req, res) => {
  try {
    const query = 'SELECT id, email, created_at FROM users WHERE id = ? AND deleted_at IS NULL';
    const [results] = await db.query(query, [req.params.id]);
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(results[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: error.message });
  }
})

module.exports = usersRouter;