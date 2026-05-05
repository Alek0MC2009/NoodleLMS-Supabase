import {
  BarChartIcon,
  CodeIcon,
  HeadphonesIcon,
  LaptopIcon,
  MailIcon,
  RocketIcon,
  ShieldIcon,
} from "lucide-react";
import Header from "../../components/common/Header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Link } from "react-router-dom";

const SALES_BENEFITS = [
  {
    title: "Hosting personalizado",
    icon: LaptopIcon,
    description: "Podemos hostear tu plataforma en nuestros servidores.",
    list: [
      "Servidores propios de Noodle",
      "Servidores tuyos con dominio personalizado",
    ],
  },
  {
    title: "Acceso al código fuente",
    icon: CodeIcon,
    description:
      "Puedes tener acceso al código fuente de la plataforma para modificarla a tu gusto.",
    list: ["Template de Supabase incluida", "DB externa a nuestros servidores"],
  },
  {
    title: "Fácil de desplegar",
    icon: RocketIcon,
    description: "Nuestra aplicación usa las tecnologías más modernas:",
    list: [
      "React — La librería de UI más usada actualmente",
      "shadcn/ui — Componentes bonitos y reactivos",
      "Supabase — Base de datos moderna y escalable",
      "Gracias a eso es muy facil desplegarla en Vercel, Cloudfare, o servidores propios",
    ],
  },
  {
    title: "Soporte prioritario",
    icon: HeadphonesIcon,
    description: "Acceso directo a nuestro equipo técnico:",
    list: [
      "Canal de soporte dedicado",
      "Tiempo de respuesta garantizado",
      "Actualizaciones prioritarias",
    ],
  },
  {
    title: "Seguridad avanzada",
    icon: ShieldIcon,
    description: "Tu plataforma y datos siempre protegidos:",
    list: [
      "Backups automáticos diarios",
      "Cifrado de datos en reposo y tránsito",
      "Control de acceso por IP",
    ],
  },
  {
    title: "Analíticas avanzadas",
    icon: BarChartIcon,
    description: "Monitoriza el rendimiento de tu institución:",
    list: [
      "Dashboard de métricas en tiempo real",
      "Exportación de datos a Excel/CSV",
      "Reportes de progreso por alumno",
    ],
  },
];

function Ventas() {
  return (
    <div>
      <Header />
      <main className="max-w-4xl mx-auto px-4 space-y-8 py-12">
        <div className="flex items-center justify-center gap-2">
          <MailIcon className="h-8 w-8" />
          <h1 className="text-4xl font-bold">Ventas</h1>
        </div>

        <p className="text-center text-gray-500">
          ¿Tu centro educativo es más grande de lo que ofrecen nuestros planes?
          <br />
          <Link to="/contacto" className="text-blue-600 hover:underline">
            Contáctanos
          </Link>{" "}
          para hacerte una oferta personalizada.
        </p>

        <h2 className="text-3xl font-bold text-center">
          Ventajas de nuestro plan{" "}
          <span
            className="bg-gradient-to-r from-blue-600 to-indigo-600
          bg-clip-text text-transparent"
          >
            personalizado
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SALES_BENEFITS.map((benefit) => {
            const BenefitIcon = benefit.icon;
            return (
              <Card key={benefit.title}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BenefitIcon className="h-5 w-5" />
                    {benefit.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    {benefit.description}
                    {benefit.list && (
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        {benefit.list.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default Ventas;
