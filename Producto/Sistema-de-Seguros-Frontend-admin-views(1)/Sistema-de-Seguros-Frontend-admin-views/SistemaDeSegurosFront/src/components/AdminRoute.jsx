import { Navigate } from 'react-router-dom';
import AuthKeycloakServices from '../services/authKeycloakServices';

function AdminRoute({ children }) {
  if (!AuthKeycloakServices.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default AdminRoute;
