import { useState } from "react";
import Header from "../../components/common/Header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { MailIcon, PhoneIcon, MapPinIcon, CheckCircleIcon } from "lucide-react";

function Contacto() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  // De momento solo simula el envío, en un futuro se puede conectar a un servicio de email
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  const anotherMessage = () => {
    setName("");
    setEmail("");
    setCompany("");
    setMessage("");
    setSent(false);
  };

  return (
    <div>
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-12 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Contacta con nosotros</h1>
          <p className="text-gray-500 text-lg">
            ¿Tienes alguna pregunta? Estaremos encantados de ayudarte.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Formulario */}
          <Card>
            <CardHeader>
              <CardTitle>Envíanos un mensaje</CardTitle>
            </CardHeader>
            <CardContent>
              {sent ? (
                // Confirmación de envío
                <div className="flex flex-col items-center gap-4 py-8 text-center">
                  <CheckCircleIcon className="h-12 w-12 text-green-500" />
                  <h2 className="text-xl font-semibold">¡Mensaje enviado!</h2>
                  <p className="text-gray-500">
                    Nos pondremos en contacto contigo en menos de 24 horas.
                  </p>
                  <Button variant="outline" onClick={anotherMessage}>
                    Enviar otro mensaje
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <Label>Nombre</Label>
                    <Input
                      placeholder="Tu nombre"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      placeholder="tu@empresa.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label>Institución</Label>
                    <Input
                      placeholder="Nombre de tu centro educativo"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label>Mensaje</Label>
                    <textarea
                      className="border rounded-md px-3 py-2 text-sm min-h-28 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Cuéntanos qué necesitas..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Enviar mensaje
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Info de contacto */}
          <div className="flex flex-col gap-6">
            <Card>
              <CardContent className="pt-6 flex items-start gap-4">
                <MailIcon className="h-5 w-5 text-blue-500 mt-1" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-gray-500 text-sm">ventas@noodlelms.com</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 flex items-start gap-4">
                <PhoneIcon className="h-5 w-5 text-blue-500 mt-1" />
                <div>
                  <p className="font-medium">Teléfono</p>
                  <p className="text-gray-500 text-sm">+34 900 000 000</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 flex items-start gap-4">
                <MapPinIcon className="h-5 w-5 text-blue-500 mt-1" />
                <div>
                  <p className="font-medium">Ubicación</p>
                  <p className="text-gray-500 text-sm">Barcelona, España</p>
                </div>
              </CardContent>
            </Card>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-700 font-medium">
                ⏱ Tiempo de respuesta
              </p>
              <p className="text-sm text-blue-600 mt-1">
                Respondemos en menos de 24 horas en días laborables.
              </p>
              <p className="text-xs text-gray-400 text-center mt-2">
                * Este es un proyecto escolar. Los datos enviados no serán
                procesados.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Contacto;
