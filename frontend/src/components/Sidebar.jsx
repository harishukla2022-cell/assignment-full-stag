import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span>⚡</span> TaskFlow
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <span className="icon">📊</span> Dashboard
        </NavLink>
        <NavLink to="/projects" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <span className="icon">📁</span> Projects
        </NavLink>
        <NavLink to="/tasks" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <span className="icon">✅</span> Tasks
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <strong>{user?.name}</strong>
          <span className={`badge-role ${user?.role}`}>{user?.role}</span>
        </div>
        <button className="btn btn-secondary btn-sm" style={{ width: '100%' }} onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}
