// components/landing/Hero.tsx
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { ArrowRight, CheckCircle, Play } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50 to-indigo-50">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]"></div>

      <div className="container mx-auto px-4 pt-32 pb-20 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            La plataforma LMS más completa
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Simplifica la
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {" "}
              educación
            </span>
            <br />
            con Noodle LMS
          </h1>

          {/* Description */}
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Gestiona cursos, tareas y estudiantes todo en un solo lugar. La
            herramienta que profesores y alumnos necesitan para una experiencia
            educativa excepcional.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/register">
              <Button
                size="lg"
                className="text-lg gap-2 bg-blue-600 hover:bg-blue-700"
              >
                Comenzar ahora
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="text-lg">
                Ya tengo cuenta
              </Button>
            </Link>
            <Button
              size="lg"
              // variant="ghost"
              className="text-lg gap-2 hover:bg-blue-600 transition-colors duration-300"
              onClick={() => {
                // Abrir video demo
                window.open("https://www.youtube.com/watch?v=demo", "_blank");
              }}
            >
              <Play className="h-5 w-5" />
              Ver demo
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Sin compromiso</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Gratis para estudiantes</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Soporte 24/7</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>100% seguro</span>
            </div>
          </div>
        </div>

        {/* Dashboard preview image */}
        <div className="mt-16 relative">
          <div
            className="absolute inset-0 bg-gradient-to-t
           from-white via-transparent to-transparent opacity-0 md:opacity-100"
          ></div>
          <div
            className="relative rounded-xl shadow-2xl overflow-hidden border
           border-gray-200"
          >
            <img
              src="https://placehold.co/1200x600/1e40af/ffffff?text=Noodle+LMS+Dashboard+Preview"
              alt="Noodle LMS Dashboard Preview"
              className="w-full h-auto"
            />
            <div
              className="absolute inset-0 bg-gradient-to-tr
             from-blue-600/20 to-transparent pointer-events-none"
            ></div>
          </div>

          {/* Floating stats card */}
          <div
            className="absolute -bottom-6 left-1/2 transform -translate-x-1/2
           bg-white rounded-xl shadow-lg p-4 flex gap-8"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">1000+</div>
              <div className="text-xs text-gray-500">Estudiantes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">50+</div>
              <div className="text-xs text-gray-500">Profesores</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">200+</div>
              <div className="text-xs text-gray-500">Cursos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">98%</div>
              <div className="text-xs text-gray-500">Satisfacción</div>
            </div>
          </div>
        </div>

        {/* Testimonial strip */}
        <div className="mt-24 flex flex-col items-center">
          <p className="text-sm text-gray-500 mb-4">Confían en nosotros</p>
          <div className="flex flex-wrap justify-center gap-8 opacity-60">
            <div className="h-8 w-auto grayscale hover:grayscale-0 transition">
              <span className="text-xl font-bold text-gray-400">
                IES Manuel Sales i Ferre
              </span>
            </div>
            <div className="h-8 w-auto grayscale hover:grayscale-0 transition">
              <span className="text-xl font-bold text-gray-400">
                Liceo Pablo Neruda
              </span>
            </div>
            <div className="h-8 w-auto grayscale hover:grayscale-0 transition">
              <span className="text-xl font-bold text-gray-400">
                Instituto San Isidro
              </span>
            </div>
            <div className="h-8 w-auto grayscale hover:grayscale-0 transition">
              <span className="text-xl font-bold text-gray-400">
                Universidad Politecnica de Valencia
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Wave separator */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          className="w-full"
        >
          <path
            fill="#f3f4f6"
            fillOpacity="1"
            d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
      </div>
    </section>
  );
}
