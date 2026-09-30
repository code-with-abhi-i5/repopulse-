import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    // Redirect to login page and preserve attempted path
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
