// Login.tsx
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/client";
import { Eye, EyeClosed } from "lucide-react";
import {
  CardDescription,
  Card,
  CardTitle,
  CardHeader,
  CardContent,
} from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useAuth } from "../contexts/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { user, role, loading: authLoading } = useAuth();

  // ✅ Redirigir si ya hay sesión activa
  useEffect(() => {
    if (!authLoading && user && role) {
      console.log("Usuario ya logueado, redirigiendo a:", role);
      switch (role) {
        case "admin":
          navigate("/dashboard/admin", { replace: true });
          break;
        case "teacher":
          navigate("/dashboard/teacher", { replace: true });
          break;
        case "student":
          navigate("/dashboard/student", { replace: true });
          break;
        default:
          navigate("/dashboard", { replace: true });
      }
    }
  }, [user, role, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(`Ha habido un error: ${error.message}`);
        return;
      }

      // ✅ Obtener el rol del usuario después del login
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", data.user.id)
        .single();

      // ✅ Redirigir según el rol (el contexto también se actualizará automáticamente)
      switch (profile?.role) {
        case "admin":
          navigate("/dashboard/admin", { replace: true });
          break;
        case "teacher":
          navigate("/dashboard/teacher", { replace: true });
          break;
        case "student":
          navigate("/dashboard/student", { replace: true });
          break;
        default:
          navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setError("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Mostrar loading mientras AuthContext se inicializa
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Inicia sesión en Noodle LMS</CardTitle>
          <CardDescription>
            Tu plataforma de aprendizaje de confianza
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeClosed size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>

            <div className="text-center">
              <Link
                to="/register"
                className="text-sm text-blue-500 hover:underline"
              >
                ¿No tienes cuenta? Regístrate
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Login;
