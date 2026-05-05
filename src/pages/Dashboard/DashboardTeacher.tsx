/* eslint-disable react-hooks/immutability */
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

function DashboardTeacher() {
  const [userId, setUserId] = useState<string>("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
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

  // Estado formulario nueva tarea
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskMaxScore, setTaskMaxScore] = useState("100");
  const [taskCourseId, setTaskCourseId] = useState("");
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);

  // Estado para puntuar entrega
  const [scoreValue, setScoreValue] = useState("");
  const [feedbackValue, setFeedbackValue] = useState("");
  const [scoreDialogOpen, setScoreDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);

  const [formError, setFormError] = useState("");

  // ✅ Obtener userId del contexto
  useEffect(() => {
    if (user?.id) {
      setUserId(user.id);
      fetchCourses(user.id);
    }
  }, [user]);

  // Cuando tenemos los cursos, cargamos tareas y entregas
  useEffect(() => {
    if (courses.length === 0) return;
    const courseIds = courses.map((c) => c.id);
    fetchTasks(courseIds);
    fetchSubmissions(courseIds);
  }, [courses]);

  const fetchCourses = async (uid: string) => {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("teacher_id", uid);
    if (error) {
      console.error(error);
      return;
    }
    setCourses(data);
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

  const fetchSubmissions = async (courseIds: number[]) => {
    const { data, error } = await supabase
      .from("submissions")
      .select("*, tasks!inner(title, course_id)")
      .in("tasks.course_id", courseIds);
    if (error) {
      console.error(error);
      return;
    }
    setSubmissions(data);
  };

  // ✅ Manejar cierre de sesión usando el contexto
  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  const handleCreateTask = async () => {
    setFormError("");

    if (!taskTitle || !taskCourseId) {
      setFormError("Título y curso son obligatorios");
      return;
    }

    const { error } = await supabase.from("tasks").insert({
      title: taskTitle,
      description: taskDesc || null,
      due_date: taskDueDate || null,
      max_score: parseInt(taskMaxScore),
      course_id: parseInt(taskCourseId),
    });

    if (error) {
      setFormError(error.message);
      return;
    }

    setTaskTitle("");
    setTaskDesc("");
    setTaskDueDate("");
    setTaskMaxScore("100");
    setTaskCourseId("");
    setTaskDialogOpen(false);
    fetchTasks(courses.map((c) => c.id));
  };

  const handleScoreSubmission = async () => {
    if (!selectedSubmission) return;

    if (!scoreValue) {
      setFormError("La puntuación es obligatoria");
      return;
    }

    const { error } = await supabase
      .from("submissions")
      .update({ score: parseInt(scoreValue), feedback: feedbackValue || null })
      .eq("id", selectedSubmission.id);

    if (error) {
      console.error(error);
      setFormError(error.message);
      return;
    }

    setSubmissions(
      submissions.map((s) =>
        s.id === selectedSubmission.id
          ? {
              ...s,
              score: parseInt(scoreValue),
              feedback: feedbackValue || null,
            }
          : s,
      ),
    );

    setScoreDialogOpen(false);
    setScoreValue("");
    setFeedbackValue("");
    setSelectedSubmission(null);
    setFormError("");
  };

  // Obtener nombre del curso para una tarea
  const getCourseName = (courseId: number) => {
    return courses.find((c) => c.id === courseId)?.name ?? "—";
  };

  // Obtener título de la tarea para una entrega
  const getTaskTitle = (taskId: number) => {
    return tasks.find((t) => t.id === taskId)?.title ?? `Tarea ${taskId}`;
  };

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
          <h1 className="text-xl font-bold">Noodle LMS — Profesor</h1>
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
                  : "Entregas"}
            </button>
          ))}
        </aside>

        <main className="flex-1 p-8">
          {/* Mis cursos */}
          {activeTab === "courses" && (
            <div>
              <h2 className="text-lg font-semibold mb-4">
                Mis cursos ({courses.length})
              </h2>
              <div className="bg-white rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Creado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center text-gray-400 py-8"
                        >
                          No tienes cursos asignados
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  Tareas ({tasks.length})
                </h2>
                <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
                  <DialogTrigger asChild>
                    <Button disabled={courses.length === 0}>Crear tarea</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nueva tarea</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 mt-2">
                      <div>
                        <Label>Título *</Label>
                        <Input
                          value={taskTitle}
                          onChange={(e) => setTaskTitle(e.target.value)}
                          placeholder="Título de la tarea"
                        />
                      </div>
                      <div>
                        <Label>Descripción (opcional)</Label>
                        <textarea
                          className="border rounded-md px-3 py-2 text-sm w-full min-h-[80px]"
                          value={taskDesc}
                          onChange={(e) => setTaskDesc(e.target.value)}
                          placeholder="Descripción de la tarea..."
                        />
                      </div>
                      <div>
                        <Label>Fecha límite (opcional)</Label>
                        <Input
                          type="datetime-local"
                          value={taskDueDate}
                          onChange={(e) => setTaskDueDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Puntuación máxima</Label>
                        <Input
                          type="number"
                          value={taskMaxScore}
                          onChange={(e) => setTaskMaxScore(e.target.value)}
                          min="1"
                          max="100"
                        />
                      </div>
                      <div>
                        <Label>Curso *</Label>
                        <select
                          className="border rounded-md px-3 py-2 text-sm w-full"
                          value={taskCourseId}
                          onChange={(e) => setTaskCourseId(e.target.value)}
                        >
                          <option value="">Selecciona un curso</option>
                          {courses.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      {formError && (
                        <p className="text-red-500 text-sm">{formError}</p>
                      )}
                      <Button onClick={handleCreateTask}>Crear tarea</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="bg-white rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Curso</TableHead>
                      <TableHead>Fecha límite</TableHead>
                      <TableHead>Puntuación máx.</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center text-gray-400 py-8"
                        >
                          No hay tareas todavía. Crea tu primera tarea.
                        </TableCell>
                      </TableRow>
                    ) : (
                      tasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell className="font-medium">
                            {task.title}
                          </TableCell>
                          <TableCell className="text-gray-500">
                            {getCourseName(task.course_id)}
                          </TableCell>
                          <TableCell className="text-gray-500">
                            {task.due_date
                              ? new Date(task.due_date).toLocaleDateString()
                              : "Sin fecha"}
                          </TableCell>
                          <TableCell>{task.max_score ?? 100}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Entregas */}
          {activeTab === "submissions" && (
            <div>
              <h2 className="text-lg font-semibold mb-4">
                Entregas pendientes (
                {submissions.filter((s) => s.score === null).length})
                {submissions.length > 0 && ` / Total: ${submissions.length}`}
              </h2>
              <div className="bg-white rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tarea</TableHead>
                      <TableHead>Curso</TableHead>
                      <TableHead>Contenido</TableHead>
                      <TableHead>Puntuación</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-gray-400 py-8"
                        >
                          No hay entregas de estudiantes todavía
                        </TableCell>
                      </TableRow>
                    ) : (
                      submissions.map((sub) => (
                        <TableRow key={sub.id}>
                          <TableCell className="font-medium">
                            {getTaskTitle(sub.task_id)}
                          </TableCell>
                          <TableCell className="text-gray-500">
                            {getCourseName(
                              tasks.find((t) => t.id === sub.task_id)
                                ?.course_id ?? 0,
                            )}
                          </TableCell>
                          <TableCell className="text-gray-500 max-w-xs truncate">
                            {sub.content ?? "—"}
                          </TableCell>
                          <TableCell>
                            {sub.score !== null ? `${sub.score}/100` : "—"}
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
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedSubmission(sub);
                                setScoreValue(sub.score?.toString() || "");
                                setFeedbackValue(sub.feedback || "");
                                setScoreDialogOpen(true);
                              }}
                              variant={
                                sub.score !== null ? "outline" : "default"
                              }
                            >
                              {sub.score !== null ? "Revisar" : "Puntuar"}
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

      {/* Dialog para puntuar entrega */}
      <Dialog open={scoreDialogOpen} onOpenChange={setScoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedSubmission?.score !== null ? "Revisar" : "Puntuar"}{" "}
              entrega
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-2">
            <div>
              <Label>Puntuación (0-100)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={scoreValue}
                onChange={(e) => setScoreValue(e.target.value)}
                placeholder="0-100"
              />
            </div>
            <div>
              <Label>Feedback (opcional)</Label>
              <textarea
                className="border rounded-md px-3 py-2 text-sm w-full min-h-[80px]"
                value={feedbackValue}
                onChange={(e) => setFeedbackValue(e.target.value)}
                placeholder="Comentarios para el estudiante..."
              />
            </div>
            {formError && <p className="text-red-500 text-sm">{formError}</p>}
            <Button onClick={handleScoreSubmission}>Guardar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DashboardTeacher;
