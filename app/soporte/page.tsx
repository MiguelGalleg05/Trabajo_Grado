"use client"

import Link from "next/link"
import { LifeBuoy, Mail, MessageCircle, ArrowLeft, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const supportChannels = [
  {
    title: "Correo de soporte",
    description: "Escríbenos a soporte.ingenieria@amigo.edu.co y responde el mensaje automático para priorizar tu caso.",
    icon: Mail,
    actionLabel: "Enviar correo",
    href: "mailto:soporte.ingenieria@amigo.edu.co",
  },
  {
    title: "Mesa de ayuda",
    description: "Registra un ticket con capturas de pantalla y el código de error desde la intranet académica.",
    icon: LifeBuoy,
    actionLabel: "Abrir mesa de ayuda",
    href: "https://intranet.amigo.edu.co/mesa-de-ayuda",
  },
  {
    title: "Canal Teams",
    description: "Únete al canal #proyecto-tomates para conversar con el equipo y recibir seguimiento en tiempo real.",
    icon: MessageCircle,
    actionLabel: "Abrir Teams",
    href: "https://teams.microsoft.com",
  },
]

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-10">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <LifeBuoy className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Centro de soporte</h1>
          <p className="mt-2 text-muted-foreground text-balance">
            Aquí encontrarás los canales de ayuda y recomendaciones para resolver incidencias relacionadas con el sistema de análisis.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {supportChannels.map((channel) => (
            <Card key={channel.title} className="border-0 bg-card/85 shadow-lg backdrop-blur">
              <CardHeader className="space-y-1">
                <div className="flex items-center gap-3">
                  <channel.icon className="h-5 w-5 text-primary" />
                  <CardTitle className="font-serif text-xl">{channel.title}</CardTitle>
                </div>
                <CardDescription>{channel.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full justify-center gap-2">
                  <Link href={channel.href} target="_blank" rel="noreferrer">
                    {channel.actionLabel}
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8 border-0 bg-card/85 shadow-lg backdrop-blur">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="font-serif text-2xl">Consejos para una respuesta rápida</CardTitle>
            <CardDescription>
              Antes de contactar al equipo, verifica que cuentas con conexión estable a internet y adjunta la información técnica relevante.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm text-muted-foreground">
            <p>• Incluye el mensaje de error exacto y el paso donde ocurrió.</p>
            <p>• Comparte capturas de pantalla o archivos de registro si están disponibles.</p>
            <p>• Indica el usuario con el que inicias sesión y el navegador utilizado.</p>
          </CardContent>
        </Card>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <Link href="/" className="font-medium text-primary hover:text-primary/80">
              Volver al inicio de sesión
            </Link>
          </div>
          <Link href="/recuperar-contrasena" className="font-medium text-primary hover:text-primary/80">
            Recuperar contraseña
          </Link>
          <Link href="/registro" className="font-medium text-primary hover:text-primary/80">
            Solicitar registro
          </Link>
        </div>
      </div>
    </div>
  )
}
