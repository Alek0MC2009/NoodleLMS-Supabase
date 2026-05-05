import { CodeIcon, LaptopIcon, MailIcon } from "lucide-react";
import Header from "../../components/common/Header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

function Ventas() {
  return (
    <div>
      <Header />

      <main>
        <h1 className="text-2xl font-bold text-center my-10">
          <MailIcon />
          Contacta con ventas
        </h1>
        <p className="text-center text-gray-500 my-10">
          ¿Tu centro educactivo es mas grande de lo que ofrecen nuestros 3
          planes principales? <br />
          Entonces contactanos para que te hagamos una oferta personalizada.
        </p>

        <h1 className="text-3xl font-bold text-center my-10">
          Ventajas de nuestro plan{" "}
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            personalizado
          </span>{" "}
          de empresas
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex items-center gap-2">
              <CardTitle className="flex items-center gap-2">
                <LaptopIcon className="h-5 w-5" />
                Hosting personalizado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Podemos Hostear tu plataforma en nuestros servidores.
                <br />
                Tambien puedes hostear la plataforma en tus propios servidores
                con dominio personalizado.
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LaptopIcon className="h-5 w-5" />
                Hosting personalizado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Puedes tener acceso al código fuente de la plataforma para
                modificarla a tu gusto.
                <br />
                Tambien podemos proporcionarte una template de Supabase (el
                servicio de DB que usamos) para que puedas tener tu propia DB
                externa a nuestros servidores.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default Ventas;
