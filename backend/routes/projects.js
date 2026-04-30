const express = require('express');
const router = express.Router();
const db = require('../database');
const authMiddleware = require('../middleware/auth');

// GET /api/projects
router.get('/', authMiddleware, (req, res) => {
  let projects;
  if (req.user.role === 'admin') {
    projects = db.all(`
      SELECT p.id, p.name, p.description, p.owner_id, p.created_at,
        u.name AS owner_name,
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) AS task_count,
        (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) AS member_count
      FROM projects p
      JOIN users u ON p.owner_id = u.id
      ORDER BY p.created_at DESC
    `, []);
  } else {
    projects = db.all(`
      SELECT DISTINCT p.id, p.name, p.description, p.owner_id, p.created_at,
        u.name AS owner_name,
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) AS task_count,
        (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) AS member_count
      FROM projects p
      JOIN users u ON p.owner_id = u.id
      LEFT JOIN project_members pm ON pm.project_id = p.id
      WHERE p.owner_id = ? OR pm.user_id = ?
      ORDER BY p.created_at DESC
    `, [req.user.id, req.user.id]);
  }
  res.json(projects);
});

// POST /api/projects
router.post('/', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ error: 'Only admins can create projects.' });

  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Project name is required.' });

  const result = db.run(
    'INSERT INTO projects (name, description, owner_id) VALUES (?, ?, ?)',
    [name, description || '', req.user.id]
  );
  db.run(
    'INSERT OR IGNORE INTO project_members (project_id, user_id) VALUES (?, ?)',
    [result.lastInsertRowid, req.user.id]
  );

  const project = db.get('SELECT * FROM projects WHERE id = ?', [result.lastInsertRowid]);
  res.status(201).json(project);
});

// GET /api/projects/:id
router.get('/:id', authMiddleware, (req, res) => {
  const project = db.get(`
    SELECT p.*, u.name AS owner_name
    FROM projects p JOIN users u ON p.owner_id = u.id
    WHERE p.id = ?
  `, [req.params.id]);

  if (!project) return res.status(404).json({ error: 'Project not found.' });

  const members = db.all(`
    SELECT u.id, u.name, u.email, u.role
    FROM users u JOIN project_members pm ON pm.user_id = u.id
    WHERE pm.project_id = ?
  `, [req.params.id]);

  const tasks = db.all(`
    SELECT t.*, u.name AS assignee_name
    FROM tasks t LEFT JOIN users u ON t.assignee_id = u.id
    WHERE t.project_id = ? ORDER BY t.created_at DESC
  `, [req.params.id]);

  res.json({ ...project, members, tasks });
});

// PUT /api/projects/:id
router.put('/:id', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ error: 'Only admins can update projects.' });

  const { name, description } = req.body;
  db.run('UPDATE projects SET name = ?, description = ? WHERE id = ?', [name, description, req.params.id]);
  const project = db.get('SELECT * FROM projects WHERE id = ?', [req.params.id]);
  res.json(project);
});

// DELETE /api/projects/:id
router.delete('/:id', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ error: 'Only admins can delete projects.' });

  // Delete tasks and members first (foreign keys)
  db.run('DELETE FROM tasks WHERE project_id = ?', [req.params.id]);
  db.run('DELETE FROM project_members WHERE project_id = ?', [req.params.id]);
  db.run('DELETE FROM projects WHERE id = ?', [req.params.id]);
  res.json({ message: 'Project deleted successfully.' });
});

// POST /api/projects/:id/members
router.post('/:id/members', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ error: 'Only admins can add members.' });

  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId is required.' });

  db.run('INSERT OR IGNORE INTO project_members (project_id, user_id) VALUES (?, ?)', [req.params.id, userId]);

  const members = db.all(`
    SELECT u.id, u.name, u.email, u.role
    FROM users u JOIN project_members pm ON pm.user_id = u.id
    WHERE pm.project_id = ?
  `, [req.params.id]);

  res.json(members);
});

// DELETE /api/projects/:id/members/:userId
router.delete('/:id/members/:userId', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ error: 'Only admins can remove members.' });

  db.run('DELETE FROM project_members WHERE project_id = ? AND user_id = ?', [req.params.id, req.params.userId]);
  res.json({ message: 'Member removed.' });
});

module.exports = router;
