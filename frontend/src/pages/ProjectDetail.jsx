import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import api from '../api';

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'medium', due_date: '', assignee_id: '', status: 'todo' });
  const [selectedUserId, setSelectedUserId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchProject = async () => {
    try {
      const [projRes, usersRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get('/users'),
      ]);
      setProject(projRes.data);
      setAllUsers(usersRes.data);
    } catch {
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProject(); }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.post('/tasks', { ...taskForm, project_id: id });
      setShowTaskModal(false);
      setTaskForm({ title: '', description: '', priority: 'medium', due_date: '', assignee_id: '', status: 'todo' });
      fetchProject();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create task.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;
    try {
      await api.post(`/projects/${id}/members`, { userId: selectedUserId });
      setShowMemberModal(false);
      setSelectedUserId('');
      fetchProject();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add member.');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member?')) return;
    await api.delete(`/projects/${id}/members/${userId}`);
    fetchProject();
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    await api.delete(`/tasks/${taskId}`);
    fetchProject();
  };

  const statusBadge = (s) => {
    if (s === 'todo') return <span className="badge badge-todo">Todo</span>;
    if (s === 'in-progress') return <span className="badge badge-inprogress">In Progress</span>;
    return <span className="badge badge-done">Done</span>;
  };

  const priorityBadge = (p) => {
    if (p === 'high') return <span className="badge badge-high">High</span>;
    if (p === 'medium') return <span className="badge badge-medium">Medium</span>;
    return <span className="badge badge-low">Low</span>;
  };

  if (loading) return <div className="loading">⏳ Loading project...</div>;
  if (!project) return null;

  const nonMembers = allUsers.filter(u => !project.members.find(m => m.id === u.id));

  return (
    <div>
      <div className="page-header">
        <div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/projects')} style={{ marginBottom: 12 }}>
            ← Back
          </button>
          <h1 className="page-title">{project.name}</h1>
          {project.description && <p style={{ color: 'var(--text2)', marginTop: 4, fontSize: 14 }}>{project.description}</p>}
        </div>
        {user?.role === 'admin' && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary" onClick={() => setShowMemberModal(true)}>👥 Add Member</button>
            <button id="add-task-btn" className="btn btn-primary" onClick={() => setShowTaskModal(true)}>+ Add Task</button>
          </div>
        )}
      </div>

      {/* Members */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="section-title">👥 Team Members ({project.members.length})</div>
        <div className="members-list">
          {project.members.map(m => (
            <div key={m.id} className="member-chip">
              <div className="member-avatar">{m.name[0].toUpperCase()}</div>
              <span>{m.name}</span>
              <span className={`badge-role ${m.role}`}>{m.role}</span>
              {user?.role === 'admin' && m.id !== project.owner_id && (
                <button onClick={() => handleRemoveMember(m.id)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', marginLeft: 4 }}>✕</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tasks */}
      <div className="card">
        <div className="section-title">📋 Tasks ({project.tasks.length})</div>
        {project.tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No tasks yet</h3>
            {user?.role === 'admin' && <p>Click "+ Add Task" to create the first task.</p>}
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Assignee</th>
                  <th>Due Date</th>
                  {user?.role === 'admin' && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {project.tasks.map(task => {
                  const today = new Date().toISOString().split('T')[0];
                  const isOverdue = task.due_date && task.due_date < today && task.status !== 'done';
                  return (
                    <tr key={task.id}>
                      <td style={{ fontWeight: 600 }}>{task.title}</td>
                      <td>{statusBadge(task.status)}</td>
                      <td>{priorityBadge(task.priority)}</td>
                      <td style={{ color: 'var(--text2)' }}>{task.assignee_name || '—'}</td>
                      <td className={isOverdue ? 'task-due overdue' : 'task-due'}>{task.due_date || '—'}</td>
                      {user?.role === 'admin' && (
                        <td>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDeleteTask(task.id)}>🗑</button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {showTaskModal && (
        <Modal title="Create Task" onClose={() => setShowTaskModal(false)}>
          {error && <div className="error-msg">{error}</div>}
          <form onSubmit={handleCreateTask}>
            <div className="form-group">
              <label className="form-label">Task Title *</label>
              <input type="text" placeholder="e.g. Design landing page" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea rows={2} placeholder="Task details..." value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} style={{ resize: 'vertical' }} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select value={taskForm.status} onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}>
                  <option value="todo">Todo</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input type="date" value={taskForm.due_date} onChange={e => setTaskForm({ ...taskForm, due_date: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Assign To</label>
                <select value={taskForm.assignee_id} onChange={e => setTaskForm({ ...taskForm, assignee_id: e.target.value })}>
                  <option value="">Unassigned</option>
                  {project.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : '✨ Create Task'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Member Modal */}
      {showMemberModal && (
        <Modal title="Add Team Member" onClose={() => setShowMemberModal(false)}>
          <form onSubmit={handleAddMember}>
            <div className="form-group">
              <label className="form-label">Select User</label>
              <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} required>
                <option value="">-- Choose a user --</option>
                {nonMembers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
              </select>
            </div>
            {nonMembers.length === 0 && <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 16 }}>All registered users are already in this project.</p>}
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowMemberModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={!selectedUserId}>Add Member</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
