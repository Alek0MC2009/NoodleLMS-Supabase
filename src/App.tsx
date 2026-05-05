import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DashBoardAdmin from "./pages/Dashboard/DashboardAdmin";
import DashBoardTeacher from "./pages/Dashboard/DashboardTeacher";
import DashboardStudent from "./pages/Dashboard/DashboardStudent";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Ventas from "./pages/static/Ventas";

function DashboardRedirect() {
  const { loading, user, role } = useAuth();

  // FIX: Ruta fallback real para "/dashboard" y sin bloqueo mientras auth inicializa.
  if (loading) return <div>Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;

  switch (role) {
    case "admin":
      return <Navigate to="/dashboard/admin" replace />;
    case "teacher":
      return <Navigate to="/dashboard/teacher" replace />;
    case "student":
      return <Navigate to="/dashboard/student" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

function UnauthorizedPage() {
  // FIX: Ruta explícita para evitar navegación a path inexistente.
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Sin acceso</h1>
        <p className="mt-2 text-gray-600">
          No tienes permisos para ver esta página.
        </p>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<DashboardRedirect />} />
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashBoardAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/teacher"
            element={
              <ProtectedRoute allowedRoles={["teacher", "admin"]}>
                <DashBoardTeacher />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/student"
            element={
              <ProtectedRoute allowedRoles={["student", "admin"]}>
                <DashboardStudent />
              </ProtectedRoute>
            }
          />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/ventas" element={<Ventas />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
