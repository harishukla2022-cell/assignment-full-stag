import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, projectsRes] = await Promise.all([
          api.get('/tasks'),
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
    fetchData();
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const totalTasks = tasks.length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const done = tasks.filter(t => t.status === 'done').length;
  const overdue = tasks.filter(t => t.due_date && t.due_date < today && t.status !== 'done').length;

  const statusBadge = (status) => {
    if (status === 'todo') return <span className="badge badge-todo">Todo</span>;
    if (status === 'in-progress') return <span className="badge badge-inprogress">In Progress</span>;
    if (status === 'done') return <span className="badge badge-done">Done</span>;
  };

  const priorityBadge = (p) => {
    if (p === 'high') return <span className="badge badge-high">High</span>;
    if (p === 'medium') return <span className="badge badge-medium">Medium</span>;
    return <span className="badge badge-low">Low</span>;
  };

  if (loading) return <div className="loading">⏳ Loading dashboard...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, <span>{user?.name?.split(' ')[0]}</span> 👋</h1>
          <p style={{ color: 'var(--text2)', marginTop: 4, fontSize: 14 }}>Here's what's happening with your projects</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card purple">
          <div className="stat-icon">📁</div>
          <div className="stat-number">{projects.length}</div>
          <div className="stat-label">Total Projects</div>
        </div>
        <div className="stat-card cyan">
          <div className="stat-icon">📋</div>
          <div className="stat-number">{totalTasks}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">✅</div>
          <div className="stat-number">{done}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon">⚠️</div>
          <div className="stat-number">{overdue}</div>
          <div className="stat-label">Overdue</div>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="card">
        <div className="section-title">📋 Recent Tasks</div>
        {tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No tasks yet</h3>
            <p>Tasks assigned to you will appear here</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Project</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {tasks.slice(0, 8).map(task => {
                  const isOverdue = task.due_date && task.due_date < today && task.status !== 'done';
                  return (
                    <tr key={task.id} style={{ cursor: 'pointer' }} onClick={() => navigate('/tasks')}>
                      <td style={{ fontWeight: 600 }}>{task.title}</td>
                      <td style={{ color: 'var(--text2)' }}>{task.project_name}</td>
                      <td>{statusBadge(task.status)}</td>
                      <td>{priorityBadge(task.priority)}</td>
                      <td className={isOverdue ? 'task-due overdue' : 'task-due'}>
                        {task.due_date || '—'} {isOverdue && '🔴'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
