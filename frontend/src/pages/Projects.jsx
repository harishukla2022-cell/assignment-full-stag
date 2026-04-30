import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import api from '../api';

export default function Projects() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.post('/projects', form);
      setShowModal(false);
      setForm({ name: '', description: '' });
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create project.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this project and all its tasks?')) return;
    await api.delete(`/projects/${id}`);
    fetchProjects();
  };

  if (loading) return <div className="loading">⏳ Loading projects...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📁 <span>Projects</span></h1>
        {user?.role === 'admin' && (
          <button id="create-project-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
            + New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No projects yet</h3>
          <p>{user?.role === 'admin' ? 'Click "+ New Project" to create one.' : 'Wait for an admin to add you to a project.'}</p>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(project => (
            <div key={project.id} className="project-card" onClick={() => navigate(`/projects/${project.id}`)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="project-card-name">{project.name}</div>
                {user?.role === 'admin' && (
                  <button className="btn btn-danger btn-sm" onClick={(e) => handleDelete(e, project.id)}>🗑</button>
                )}
              </div>
              <div className="project-card-desc">
                {project.description || 'No description provided.'}
              </div>
              <div className="project-card-meta">
                <span className="project-meta-item">📋 {project.task_count} tasks</span>
                <span className="project-meta-item">👥 {project.member_count} members</span>
                <span className="project-meta-item">👤 {project.owner_name}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title="Create New Project" onClose={() => setShowModal(false)}>
          {error && <div className="error-msg">{error}</div>}
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label className="form-label">Project Name *</label>
              <input
                id="project-name-input"
                type="text"
                placeholder="e.g. Website Redesign"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                id="project-desc-input"
                rows={3}
                placeholder="What is this project about?"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                style={{ resize: 'vertical' }}
              />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button id="save-project-btn" type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Creating...' : '✨ Create Project'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
