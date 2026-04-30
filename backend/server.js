require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDb } = require('./database');

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));

app.get('/', (req, res) => res.json({ message: 'Team Task Manager API is running!' }));

const PORT = process.env.PORT || 5000;

// Initialize database FIRST, then start server
initDb().then(() => {
  app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
