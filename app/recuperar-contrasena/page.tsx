"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function RecoverPasswordPage() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    // TODO: Integrate backend recovery endpoint.
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitted(true)
    }, 1200)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Recuperar acceso</h1>
          <p className="mt-2 text-muted-foreground text-balance">
            Ingresa el correo electrónico asociado a tu cuenta para recibir un enlace de restablecimiento.
          </p>
        </div>

        <Card className="border-0 bg-card/85 shadow-xl backdrop-blur">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="font-serif text-2xl">Restablecer contraseña</CardTitle>
            <CardDescription>
              Te enviaremos instrucciones paso a paso a tu bandeja de entrada.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2 text-left">
                <Label htmlFor="email" className="text-sm font-medium">
                  Correo electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu.email@ejemplo.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="h-11"
                />
              </div>

              {submitted ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                  ¡Listo! Si el correo está registrado, recibirás un mensaje con el enlace para restablecer tu contraseña.
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Asegúrate de revisar la carpeta de spam o promociones si no recibes el mensaje en los próximos minutos.
                </p>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enviando instrucciones..." : "Enviar enlace de recuperación"}
              </Button>
            </form>

            <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                <Link href="/" className="font-medium text-primary hover:text-primary/80">
                  Volver al inicio de sesión
                </Link>
              </div>
              <Link href="/soporte" className="font-medium text-primary hover:text-primary/80">
                ¿Necesitas más ayuda?
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}







