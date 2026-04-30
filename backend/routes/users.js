const express = require('express');
const router = express.Router();
const db = require('../database');
const authMiddleware = require('../middleware/auth');

// GET /api/users
router.get('/', authMiddleware, (req, res) => {
  const users = db.all('SELECT id, name, email, role, created_at FROM users ORDER BY name', []);
  res.json(users);
});

module.exports = router;
