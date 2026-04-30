import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Wraps protected pages — redirects to login if not logged in
export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}
