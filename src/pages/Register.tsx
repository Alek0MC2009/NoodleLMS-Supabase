import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/client";
import { useAuth } from "../contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Eye, EyeClosed } from "lucide-react";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, role, loading: authLoading } = useAuth();

  // ✅ Redirigir si ya hay sesión activa (no debería estar en registro)
  useEffect(() => {
    if (!authLoading && user && role) {
      console.log("Usuario ya logueado, redirigiendo a dashboard");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // ✅ Validaciones
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      // ✅ 1. Registrar usuario en Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username, // Guardar username en metadata
          },
        },
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (!data.user) {
        setError("Error al crear el usuario");
        return;
      }

      // ✅ 2. Insertar perfil en la tabla users
      const { error: insertError } = await supabase.from("users").insert({
        id: data.user.id,
        username,
        email,
        role: "student", // Por defecto, todos los nuevos usuarios son estudiantes
        created_at: new Date().toISOString(),
      });

      if (insertError) {
        console.error("Error insertando perfil:", insertError);
        setError(insertError.message);

        // ✅ Si falla la inserción, limpiar el usuario creado en Auth
        await supabase.auth.signOut();
        return;
      }

      // ✅ 3. Iniciar sesión automáticamente después del registro
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error("Error al iniciar sesión automático:", signInError);
        navigate("/login");
        return;
      }

      // ✅ El AuthContext se actualizará automáticamente y redirigirá
      // No necesitas navegar aquí porque el useEffect de AuthContext lo hará
    } catch (err) {
      console.error("Error inesperado:", err);
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
          <CardTitle>Regístrate en Noodle LMS</CardTitle>
          <CardDescription>
            Tu plataforma de aprendizaje de confianza
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre de usuario</label>
              <Input
                type="text"
                placeholder="usuario123"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Contraseña</label>
              <div className="relative">
                <Input
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
              <p className="text-xs text-gray-500">Mínimo 6 caracteres</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Confirmar contraseña
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Registrando..." : "Registrarse"}
            </Button>

            <div className="text-center">
              <Link
                to="/login"
                className="text-sm text-blue-500 hover:underline"
              >
                ¿Ya tienes una cuenta? Inicia sesión
              </Link>
              <br />
              <Link to="/" className="text-sm hover:underline">
                Volver a la pagina de inicio
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Register;
