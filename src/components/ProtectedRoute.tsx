// components/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  const { user, loading, role } = useAuth();

  // FIX: Mientras AuthContext se resuelve, mostramos estado temporal controlado.
  if (loading) return <div>Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  // FIX: Si el usuario no tiene rol válido para la ruta, redirigimos a /unauthorized.
  if (allowedRoles && !allowedRoles.includes(role || "")) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <>{children}</>;
}
