import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import api from '../api';

const STATUSES = ['todo', 'in-progress', 'done'];
const STATUS_LABELS = { 'todo': '📝 Todo', 'in-progress': '⚡ In Progress', 'done': '✅ Done' };

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterProject, setFilterProject] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchTasks = async () => {
    try {
      const params = filterProject ? `?projectId=${filterProject}` : '';
      const [tasksRes, projectsRes] = await Promise.all([
        api.get(`/tasks${params}`),
        api.get('/projects'),
      ]);
      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, [filterProject]);

  const handleStatusUpdate = async () => {
    setSaving(true);
    try {
      await api.put(`/tasks/${selectedTask.id}`, { ...selectedTask, status: editStatus });
      setSelectedTask(null);
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    await api.delete(`/tasks/${taskId}`);
    fetchTasks();
  };

  const today = new Date().toISOString().split('T')[0];

  const priorityBadge = (p) => {
    if (p === 'high') return <span className="badge badge-high">High</span>;
    if (p === 'medium') return <span className="badge badge-medium">Medium</span>;
    return <span className="badge badge-low">Low</span>;
  };

  if (loading) return <div className="loading">⏳ Loading tasks...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">✅ <span>Task Board</span></h1>
        <select
          id="filter-project"
          value={filterProject}
          onChange={e => setFilterProject(e.target.value)}
          style={{ width: 'auto', minWidth: 200 }}
        >
          <option value="">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {/* Kanban Board */}
      <div className="kanban-board">
        {STATUSES.map(status => {
          const colTasks = tasks.filter(t => t.status === status);
          return (
            <div key={status} className="kanban-col">
              <div className="kanban-col-header">
                <span className="kanban-col-title">{STATUS_LABELS[status]}</span>
                <span className="kanban-col-count">{colTasks.length}</span>
              </div>

              <div className="kanban-tasks">
                {colTasks.length === 0 && (
                  <div className="empty-col">No tasks here</div>
                )}
                {colTasks.map(task => {
                  const isOverdue = task.due_date && task.due_date < today && task.status !== 'done';
                  return (
                    <div
                      key={task.id}
                      className="task-card"
                      onClick={() => { setSelectedTask(task); setEditStatus(task.status); }}
                    >
                      <div className="task-card-title">{task.title}</div>
                      {task.description && (
                        <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8, lineHeight: 1.4 }}>
                          {task.description.length > 60 ? task.description.slice(0, 60) + '...' : task.description}
                        </div>
                      )}
                      <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8 }}>
                        📁 {task.project_name}
                      </div>
                      <div className="task-card-meta">
                        {priorityBadge(task.priority)}
                        {task.assignee_name && <span className="task-assignee">👤 {task.assignee_name}</span>}
                        {task.due_date && (
                          <span className={`task-due ${isOverdue ? 'overdue' : ''}`}>
                            📅 {task.due_date} {isOverdue && '🔴'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Detail / Edit Modal */}
      {selectedTask && (
        <Modal title={selectedTask.title} onClose={() => setSelectedTask(null)}>
          <div style={{ marginBottom: 16 }}>
            {selectedTask.description && (
              <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 12 }}>{selectedTask.description}</p>
            )}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {priorityBadge(selectedTask.priority)}
              <span style={{ fontSize: 13, color: 'var(--text2)' }}>📁 {selectedTask.project_name}</span>
              {selectedTask.assignee_name && <span style={{ fontSize: 13, color: 'var(--text2)' }}>👤 {selectedTask.assignee_name}</span>}
              {selectedTask.due_date && <span style={{ fontSize: 13, color: 'var(--text2)' }}>📅 {selectedTask.due_date}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Update Status</label>
            <select value={editStatus} onChange={e => setEditStatus(e.target.value)}>
              <option value="todo">📝 Todo</option>
              <option value="in-progress">⚡ In Progress</option>
              <option value="done">✅ Done</option>
            </select>
          </div>

          <div className="modal-footer">
            {user?.role === 'admin' && (
              <button
                className="btn btn-danger btn-sm"
                onClick={() => { handleDeleteTask(selectedTask.id); setSelectedTask(null); }}
                style={{ marginRight: 'auto' }}
              >
                🗑 Delete
              </button>
            )}
            <button className="btn btn-secondary" onClick={() => setSelectedTask(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleStatusUpdate} disabled={saving}>
              {saving ? 'Saving...' : '💾 Save Status'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
