import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

// Create the context
const AuthContext = createContext(null);

// This provider wraps the whole app and shares user login state
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Load user from localStorage on first load
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verify the stored token is still valid
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me')
        .then(res => setUser(res.data))
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — use this in any component: const { user } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}
