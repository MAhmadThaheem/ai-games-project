import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-white text-center mt-20">Loading permissions...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <div className="text-red-500 text-center mt-20 text-2xl font-bold">⛔ ACCESS DENIED: Admins Only</div>;
  }

  return children;
};

export default ProtectedRoute;