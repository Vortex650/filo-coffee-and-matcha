import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isStaff } from "../services/auth";

export default function ProtectedRoute({ children, staffOnly = false }: { children: React.ReactNode; staffOnly?: boolean }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (staffOnly && !isStaff(user)) return <Navigate to="/account" replace />;
  return <>{children}</>;
}
