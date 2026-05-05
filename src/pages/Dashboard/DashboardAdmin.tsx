/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/client";
import { useAuth } from "../../contexts/AuthContext";
import type { Database } from "../../lib/database.types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

type User = Database["public"]["Tables"]["users"]["Row"];
type Course = Database["public"]["Tables"]["courses"]["Row"];

function DashboardAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeTab, setActiveTab] = useState<"users" | "courses">("users");
  const navigate = useNavigate();
  const { signOut, user, loading: authLoading } = useAuth(); // ✅ Usar contexto

  // ✅ Verificar que el usuario es admin (protección extra)
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Estado del formulario de crear usuario
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("student");
  const [userDialogOpen, setUserDialogOpen] = useState(false);

  // Estado del formulario de crear curso
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseDesc, setNewCourseDesc] = useState("");
  const [newCourseTeacher, setNewCourseTeacher] = useState("");
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);

  const [formError, setFormError] = useState("");

  const fetchUsers = async () => {
    const { data, error } = await supabase.from("users").select("*");
    if (error) {
      console.error(error);
      return;
    }
    setUsers(data);
  };

  const fetchCourses = async () => {
    const { data, error } = await supabase.from("courses").select("*");
    if (error) {
      console.error(error);
      return;
    }
    setCourses(data);
  };

  useEffect(() => {
    if (user) {
      fetchUsers();
      fetchCourses();
    }
  }, [user]);

  // ✅ Manejar cierre de sesión usando el contexto
  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  // Cambia el rol de un usuario
  const handleRoleChange = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from("users")
      .update({ role: newRole })
      .eq("id", userId);
    if (error) {
      console.error(error);
      return;
    }
    setUsers(
      users.map((u) =>
        u.id === userId ? { ...u, role: newRole as User["role"] } : u,
      ),
    );
  };

  // Elimina un usuario de auth y de la tabla
  const handleDeleteUser = async (userId: string) => {
    // ✅ No permitir eliminar el propio usuario
    if (userId === user?.id) {
      setFormError("No puedes eliminar tu propio usuario");
      return;
    }

    const { error } = await supabase.from("users").delete().eq("id", userId);
    if (error) {
      console.error(error);
      return;
    }
    setUsers(users.filter((u) => u.id !== userId));
  };

  // Elimina un curso
  const handleDeleteCourse = async (courseId: number) => {
    const { error } = await supabase
      .from("courses")
      .delete()
      .eq("id", courseId);
    if (error) {
      console.error(error);
      return;
    }
    setCourses(courses.filter((c) => c.id !== courseId));
  };

  // Crea un usuario nuevo con Supabase Auth + inserta en tabla users
  const handleCreateUser = async () => {
    setFormError("");

    if (!newEmail || !newPassword || !newUsername) {
      setFormError("Todos los campos son obligatorios");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: newEmail,
      password: newPassword,
      options: {
        data: {
          username: newUsername,
        },
      },
    });

    if (error) {
      setFormError(error.message);
      return;
    }

    const { error: insertError } = await supabase.from("users").insert({
      id: data.user!.id,
      username: newUsername,
      email: newEmail,
      role: newRole,
    });

    if (insertError) {
      setFormError(insertError.message);
      // Limpiar usuario creado en Auth
      await supabase.auth.admin.deleteUser(data.user!.id);
      return;
    }

    // Limpia el formulario y cierra el dialog
    setNewUsername("");
    setNewEmail("");
    setNewPassword("");
    setNewRole("student");
    setUserDialogOpen(false);
    fetchUsers();
  };

  // Crea un curso nuevo
  const handleCreateCourse = async () => {
    setFormError("");

    if (!newCourseName || !newCourseTeacher) {
      setFormError("Nombre del curso y profesor son obligatorios");
      return;
    }

    const { error } = await supabase.from("courses").insert({
      name: newCourseName,
      description: newCourseDesc || null,
      teacher_id: newCourseTeacher,
    });

    if (error) {
      setFormError(error.message);
      return;
    }

    setNewCourseName("");
    setNewCourseDesc("");
    setNewCourseTeacher("");
    setCourseDialogOpen(false);
    fetchCourses();
  };

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      admin: "bg-red-100 text-red-800",
      teacher: "bg-green-100 text-green-800",
      student: "bg-blue-100 text-blue-800",
    };
    return <Badge className={styles[role]}>{role}</Badge>;
  };

  // Lista de teachers para el select de crear curso
  const teachers = users.filter(
    (u) => u.role === "teacher" || u.role === "admin",
  );

  // ✅ Mostrar loading mientras se verifica autenticación
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // FIX: Evita pantalla en blanco; redirige de forma explícita.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Noodle LMS — Admin</h1>
          <p className="text-sm text-gray-500">Bienvenido, {user.email}</p>
        </div>
        <Button variant="outline" onClick={handleSignOut}>
          Cerrar sesión
        </Button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-48 min-h-screen bg-white border-r p-4 flex flex-col gap-2">
          <button
            onClick={() => setActiveTab("users")}
            className={`text-left px-3 py-2 rounded-md text-sm ${
              activeTab === "users"
                ? "bg-gray-100 font-medium"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Usuarios
          </button>
          <button
            onClick={() => setActiveTab("courses")}
            className={`text-left px-3 py-2 rounded-md text-sm ${
              activeTab === "courses"
                ? "bg-gray-100 font-medium"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Cursos
          </button>
        </aside>

        <main className="flex-1 p-8">
          {/* Sección usuarios */}
          {activeTab === "users" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  Usuarios ({users.length})
                </h2>

                {/* Dialog para crear usuario */}
                <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>Crear usuario</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Crear nuevo usuario</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 mt-2">
                      <div>
                        <Label>Nombre de usuario</Label>
                        <Input
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          placeholder="usuario123"
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="usuario@ejemplo.com"
                        />
                      </div>
                      <div>
                        <Label>Contraseña</Label>
                        <Input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                        />
                      </div>
                      <div>
                        <Label>Rol</Label>
                        <Select value={newRole} onValueChange={setNewRole}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="teacher">Teacher</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {formError && (
                        <p className="text-red-500 text-sm">{formError}</p>
                      )}
                      <Button onClick={handleCreateUser}>Crear</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="bg-white rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Cambiar rol</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((userItem) => (
                      <TableRow key={userItem.id}>
                        <TableCell className="font-medium">
                          {userItem.username}
                          {userItem.id === user?.id && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              Tú
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-gray-500">
                          {userItem.email}
                        </TableCell>
                        <TableCell>{getRoleBadge(userItem.role)}</TableCell>
                        <TableCell>
                          <Select
                            defaultValue={userItem.role}
                            onValueChange={(newRole) =>
                              handleRoleChange(userItem.id, newRole)
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="student">Student</SelectItem>
                              <SelectItem value="teacher">Teacher</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(userItem.id)}
                            disabled={userItem.id === user?.id}
                          >
                            Eliminar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Sección cursos */}
          {activeTab === "courses" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  Cursos ({courses.length})
                </h2>

                {/* Dialog para crear curso */}
                <Dialog
                  open={courseDialogOpen}
                  onOpenChange={setCourseDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button>Crear curso</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Crear nuevo curso</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 mt-2">
                      <div>
                        <Label>Nombre del curso</Label>
                        <Input
                          value={newCourseName}
                          onChange={(e) => setNewCourseName(e.target.value)}
                          placeholder="Introducción a React"
                        />
                      </div>
                      <div>
                        <Label>Descripción (opcional)</Label>
                        <Input
                          value={newCourseDesc}
                          onChange={(e) => setNewCourseDesc(e.target.value)}
                          placeholder="Descripción del curso..."
                        />
                      </div>
                      <div>
                        <Label>Profesor</Label>
                        <Select
                          value={newCourseTeacher}
                          onValueChange={setNewCourseTeacher}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un profesor" />
                          </SelectTrigger>
                          <SelectContent>
                            {teachers.length === 0 ? (
                              <SelectItem value="" disabled>
                                No hay profesores disponibles
                              </SelectItem>
                            ) : (
                              teachers.map((t) => (
                                <SelectItem key={t.id} value={t.id}>
                                  {t.username}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      {formError && (
                        <p className="text-red-500 text-sm">{formError}</p>
                      )}
                      <Button onClick={handleCreateCourse}>Crear</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="bg-white rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Creado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center text-gray-400 py-8"
                        >
                          No hay cursos todavía
                        </TableCell>
                      </TableRow>
                    ) : (
                      courses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell className="font-medium">
                            {course.name}
                          </TableCell>
                          <TableCell className="text-gray-500">
                            {course.description ?? "—"}
                          </TableCell>
                          <TableCell className="text-gray-500">
                            {course.created_at
                              ? new Date(course.created_at).toLocaleDateString()
                              : "—"}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteCourse(course.id)}
                            >
                              Eliminar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default DashboardAdmin;
