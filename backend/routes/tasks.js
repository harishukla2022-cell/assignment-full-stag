const express = require('express');
const router = express.Router();
const db = require('../database');
const authMiddleware = require('../middleware/auth');

// GET /api/tasks
router.get('/', authMiddleware, (req, res) => {
  const { projectId, status } = req.query;

  let sql = `
    SELECT t.*, u.name AS assignee_name, p.name AS project_name
    FROM tasks t
    LEFT JOIN users u ON t.assignee_id = u.id
    LEFT JOIN projects p ON t.project_id = p.id
    WHERE 1=1
  `;
  const params = [];

  if (req.user.role !== 'admin') {
    sql += ' AND (t.assignee_id = ? OR t.created_by = ?)';
    params.push(req.user.id, req.user.id);
  }
  if (projectId) { sql += ' AND t.project_id = ?'; params.push(Number(projectId)); }
  if (status) { sql += ' AND t.status = ?'; params.push(status); }
  sql += ' ORDER BY t.created_at DESC';

  const tasks = db.all(sql, params);
  res.json(tasks);
});

// POST /api/tasks
router.post('/', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ error: 'Only admins can create tasks.' });

  const { title, description, status, priority, due_date, project_id, assignee_id } = req.body;
  if (!title || !project_id)
    return res.status(400).json({ error: 'Title and project_id are required.' });

  const result = db.run(`
    INSERT INTO tasks (title, description, status, priority, due_date, project_id, assignee_id, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    title,
    description || '',
    status || 'todo',
    priority || 'medium',
    due_date || null,
    project_id,
    assignee_id || null,
    req.user.id
  ]);

  const task = db.get(`
    SELECT t.*, u.name AS assignee_name, p.name AS project_name
    FROM tasks t
    LEFT JOIN users u ON t.assignee_id = u.id
    LEFT JOIN projects p ON t.project_id = p.id
    WHERE t.id = ?
  `, [result.lastInsertRowid]);

  res.status(201).json(task);
});

// PUT /api/tasks/:id
router.put('/:id', authMiddleware, (req, res) => {
  const task = db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
  if (!task) return res.status(404).json({ error: 'Task not found.' });

  if (req.user.role === 'member') {
    if (task.assignee_id !== req.user.id)
      return res.status(403).json({ error: 'You can only update your own assigned tasks.' });
    const { status } = req.body;
    db.run('UPDATE tasks SET status = ? WHERE id = ?', [status, req.params.id]);
  } else {
    const { title, description, status, priority, due_date, assignee_id } = req.body;
    db.run(`
      UPDATE tasks SET title=?, description=?, status=?, priority=?, due_date=?, assignee_id=?
      WHERE id=?
    `, [
      title ?? task.title,
      description ?? task.description,
      status ?? task.status,
      priority ?? task.priority,
      due_date ?? task.due_date,
      assignee_id ?? task.assignee_id,
      req.params.id
    ]);
  }

  const updated = db.get(`
    SELECT t.*, u.name AS assignee_name, p.name AS project_name
    FROM tasks t
    LEFT JOIN users u ON t.assignee_id = u.id
    LEFT JOIN projects p ON t.project_id = p.id
    WHERE t.id = ?
  `, [req.params.id]);

  res.json(updated);
});

// DELETE /api/tasks/:id
router.delete('/:id', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ error: 'Only admins can delete tasks.' });

  db.run('DELETE FROM tasks WHERE id = ?', [req.params.id]);
  res.json({ message: 'Task deleted.' });
});

module.exports = router;
