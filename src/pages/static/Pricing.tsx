import { CheckIcon, XIcon } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../../components/common/Header";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

const PLANS = [
  {
    name: "Free",
    price: "0€",
    period: "/ mes",
    description: "Perfecto para estudiantes",
    cta: "Empezar gratis",
    ctaLink: "/register",
    highlighted: false,
    features: [
      { text: "Hasta 3 cursos", included: true },
      { text: "Tareas y entregas", included: true },
      { text: "Soporte por email", included: true },
      { text: "Dominio personalizado", included: false },
      { text: "Analíticas avanzadas", included: false },
      { text: "Soporte prioritario", included: false },
    ],
  },
  {
    name: "Pro",
    price: "29€",
    period: "/ mes",
    description: "Para centros educativos pequeños",
    cta: "Empezar prueba gratuita",
    ctaLink: "/register",
    highlighted: true, // este es el destacado
    features: [
      { text: "Cursos ilimitados", included: true },
      { text: "Tareas y entregas", included: true },
      { text: "Soporte por email", included: true },
      { text: "Dominio personalizado", included: true },
      { text: "Analíticas avanzadas", included: true },
      { text: "Soporte prioritario", included: false },
    ],
  },
  {
    name: "Enterprise",
    price: "Personalizado",
    period: "",
    description: "Para grandes instituciones",
    cta: "Contactar con ventas",
    ctaLink: "/ventas",
    highlighted: false,
    features: [
      { text: "Cursos ilimitados", included: true },
      { text: "Tareas y entregas", included: true },
      { text: "Soporte por email", included: true },
      { text: "Dominio personalizado", included: true },
      { text: "Analíticas avanzadas", included: true },
      { text: "Soporte prioritario", included: true },
    ],
  },
];

function Pricing() {
  return (
    <div>
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-12 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Planes y precios</h1>
          <p className="text-gray-500 text-lg">
            Elige el plan que mejor se adapte a tu institución
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={
                plan.highlighted
                  ? "border-2 border-blue-500 shadow-lg relative"
                  : ""
              }
            >
              {/* Badge de más popular */}
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-blue-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Más popular
                  </span>
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-500 text-sm">{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li
                      key={feature.text}
                      className="flex items-center gap-2 text-sm"
                    >
                      {feature.included ? (
                        <CheckIcon className="h-4 w-4 text-green-500 shrink-0" />
                      ) : (
                        <XIcon className="h-4 w-4 text-gray-300 shrink-0" />
                      )}
                      <span className={feature.included ? "" : "text-gray-400"}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link to={plan.ctaLink}>
                  <Button
                    className="w-full"
                    variant={plan.highlighted ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-xs text-gray-400 text-center">
          * Este es un proyecto escolar. Los precios mostrados son orientativos.
        </p>
      </main>
    </div>
  );
}

export default Pricing;
