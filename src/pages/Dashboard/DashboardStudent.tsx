/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/immutability */
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
import { Badge } from "../../components/ui/badge";

type Course = Database["public"]["Tables"]["courses"]["Row"];
type Task = Database["public"]["Tables"]["tasks"]["Row"];
type Submission = Database["public"]["Tables"]["submissions"]["Row"];
type Enrollment = Database["public"]["Tables"]["enrollments"]["Row"];

function DashboardStudent() {
  const [userId, setUserId] = useState<string>("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [activeTab, setActiveTab] = useState<
    "courses" | "tasks" | "submissions"
  >("courses");
  const navigate = useNavigate();
  const { signOut, user, loading: authLoading } = useAuth();

  // ✅ Verificar autenticación
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Estado para entregar tarea
  const [submitContent, setSubmitContent] = useState("");
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Estado para inscribirse en curso
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("");

  const [formError, setFormError] = useState("");

  // ✅ Obtener userId del contexto en lugar de hacer otra llamada
  useEffect(() => {
    if (user?.id) {
      setUserId(user.id);
      fetchEnrolledCourses(user.id);
      fetchSubmissions(user.id);
      fetchAllCourses();
    }
  }, [user]);

  // Cuando tenemos los cursos inscritos, cargamos las tareas
  useEffect(() => {
    if (courses.length === 0) return;
    fetchTasks(courses.map((c) => c.id));
  }, [courses]);

  const fetchEnrolledCourses = async (uid: string) => {
    const { data, error } = await supabase
      .from("enrollments")
      .select("courses(*)")
      .eq("user_id", uid);
    if (error) {
      console.error(error);
      return;
    }
    const enrolledCourses = data.map((e: any) => e.courses).filter(Boolean);
    setCourses(enrolledCourses);
  };

  const fetchTasks = async (courseIds: number[]) => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .in("course_id", courseIds);
    if (error) {
      console.error(error);
      return;
    }
    setTasks(data);
  };

  const fetchSubmissions = async (uid: string) => {
    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .eq("user_id", uid);
    if (error) {
      console.error(error);
      return;
    }
    setSubmissions(data);
  };

  const fetchAllCourses = async () => {
    const { data, error } = await supabase.from("courses").select("*");
    if (error) {
      console.error(error);
      return;
    }
    setAllCourses(data);
  };

  // ✅ Manejar cierre de sesión usando el contexto
  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  // Inscribirse en un curso
  const handleEnroll = async () => {
    setFormError("");
    const { error } = await supabase.from("enrollments").insert({
      user_id: userId,
      course_id: parseInt(selectedCourseId),
    });
    if (error) {
      setFormError(error.message);
      return;
    }
    setEnrollDialogOpen(false);
    setSelectedCourseId("");
    fetchEnrolledCourses(userId);
  };

  // Entregar una tarea
  const handleSubmitTask = async () => {
    if (!selectedTask) return;
    setFormError("");
    const { error } = await supabase.from("submissions").insert({
      task_id: selectedTask.id,
      user_id: userId,
      content: submitContent,
    });
    if (error) {
      setFormError(error.message);
      return;
    }
    setSubmitDialogOpen(false);
    setSubmitContent("");
    setSelectedTask(null);
    fetchSubmissions(userId);
  };

  // Comprueba si el alumno ya entregó una tarea
  const hasSubmitted = (taskId: number) =>
    submissions.some((s) => s.task_id === taskId);

  // Cursos en los que NO está inscrito todavía
  const unenrolledCourses = allCourses.filter(
    (c) => !courses.some((enrolled) => enrolled.id === c.id),
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
      <header className="bg-white border-b px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Noodle LMS — Alumno</h1>
          <p className="text-sm text-gray-500">Bienvenido, {user.email}</p>
        </div>
        <Button variant="outline" onClick={handleSignOut}>
          Cerrar sesión
        </Button>
      </header>

      <div className="flex">
        <aside className="w-48 min-h-screen bg-white border-r p-4 flex flex-col gap-2">
          {(["courses", "tasks", "submissions"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-left px-3 py-2 rounded-md text-sm ${
                activeTab === tab
                  ? "bg-gray-100 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tab === "courses"
                ? "Mis cursos"
                : tab === "tasks"
                  ? "Tareas"
                  : "Mis entregas"}
            </button>
          ))}
        </aside>

        <main className="flex-1 p-8">
          {/* Mis cursos */}
          {activeTab === "courses" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  Mis cursos ({courses.length})
                </h2>
                <Dialog
                  open={enrollDialogOpen}
                  onOpenChange={setEnrollDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button disabled={unenrolledCourses.length === 0}>
                      Inscribirse en curso
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Inscribirse en un curso</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 mt-2">
                      <div className="flex flex-col gap-1">
                        <Label>Curso</Label>
                        <select
                          className="border rounded-md px-3 py-2 text-sm"
                          value={selectedCourseId}
                          onChange={(e) => setSelectedCourseId(e.target.value)}
                        >
                          <option value="">Selecciona un curso</option>
                          {unenrolledCourses.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      {formError && (
                        <p className="text-red-500 text-sm">{formError}</p>
                      )}
                      <Button onClick={handleEnroll}>Inscribirse</Button>
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
                      <TableHead>Profesor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center text-gray-400 py-8"
                        >
                          No estás inscrito en ningún curso todavía
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
                            {course.teacher_id ?? "—"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Tareas */}
          {activeTab === "tasks" && (
            <div>
              <h2 className="text-lg font-semibold mb-4">
                Tareas ({tasks.length})
              </h2>
              <div className="bg-white rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Curso</TableHead>
                      <TableHead>Fecha límite</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-gray-400 py-8"
                        >
                          No hay tareas pendientes
                        </TableCell>
                      </TableRow>
                    ) : (
                      tasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell className="font-medium">
                            {task.title}
                          </TableCell>
                          <TableCell className="text-gray-500">
                            {courses.find((c) => c.id === task.course_id)
                              ?.name ?? "—"}
                          </TableCell>
                          <TableCell className="text-gray-500">
                            {task.due_date
                              ? new Date(task.due_date).toLocaleDateString()
                              : "Sin fecha"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                hasSubmitted(task.id)
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {hasSubmitted(task.id)
                                ? "Entregada"
                                : "Pendiente"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {!hasSubmitted(task.id) && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedTask(task);
                                  setSubmitDialogOpen(true);
                                }}
                              >
                                Entregar
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Mis entregas */}
          {activeTab === "submissions" && (
            <div>
              <h2 className="text-lg font-semibold mb-4">
                Mis entregas ({submissions.length})
              </h2>
              <div className="bg-white rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tarea</TableHead>
                      <TableHead>Contenido</TableHead>
                      <TableHead>Puntuación</TableHead>
                      <TableHead>Feedback</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-gray-400 py-8"
                        >
                          No has entregado ninguna tarea todavía
                        </TableCell>
                      </TableRow>
                    ) : (
                      submissions.map((sub) => {
                        const task = tasks.find((t) => t.id === sub.task_id);
                        return (
                          <TableRow key={sub.id}>
                            <TableCell className="font-medium">
                              {task?.title ?? `Tarea ${sub.task_id}`}
                            </TableCell>
                            <TableCell className="text-gray-500 max-w-xs truncate">
                              {sub.content ?? "—"}
                            </TableCell>
                            <TableCell>
                              {sub.score !== null ? `${sub.score}/100` : "—"}
                            </TableCell>
                            <TableCell className="text-gray-500 max-w-xs truncate">
                              {sub.feedback ?? "—"}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  sub.score !== null
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }
                              >
                                {sub.score !== null ? "Corregida" : "Pendiente"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Dialog para entregar tarea */}
      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Entregar tarea: {selectedTask?.title}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-1">
              <Label>Contenido</Label>
              <textarea
                className="border rounded-md px-3 py-2 text-sm min-h-[100px]"
                value={submitContent}
                onChange={(e) => setSubmitContent(e.target.value)}
                placeholder="Escribe tu respuesta aquí..."
              />
            </div>
            {formError && <p className="text-red-500 text-sm">{formError}</p>}
            <Button onClick={handleSubmitTask}>Entregar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DashboardStudent;
