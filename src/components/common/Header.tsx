import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useAuth } from "../../contexts/AuthContext";
import { GraduationCap, User, LogOut } from "lucide-react";

function Header() {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getDashboardLink = () => {
    switch (role) {
      case "admin":
        return "/dashboard/admin";
      case "teacher":
        return "/dashboard/teacher";
      case "student":
        return "/dashboard/student";
      default:
        return "/login";
    }
  };

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 hover:opacity-80 transition"
        >
          <GraduationCap className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Noodle LMS</h1>
            <p className="text-xs text-gray-500">
              Tu plataforma de aprendizaje
            </p>
          </div>
        </Link>

        {/* Navegación */}
        <div className="flex items-center gap-4">
          {user ? (
            // Usuario logueado
            <>
              <Link to={getDashboardLink()}>
                <Button variant="ghost" className="hidden md:flex">
                  Mi dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user.email}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{role}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Cerrar sesión</span>
                </Button>
              </div>
            </>
          ) : (
            // Usuario no logueado
            <>
              <Link to="/ventas">
                <Button variant="ghost" className="hidden md:flex">
                  Contacta con ventas
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="gap-2">
                  <User className="h-4 w-4" />
                  Iniciar sesión
                </Button>
              </Link>
              <Link to="/register">
                <Button>Comenzar gratis</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
