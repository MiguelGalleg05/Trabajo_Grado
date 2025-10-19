"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus, ArrowLeft } from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api"

type RegistrationForm = {
  fullName: string
  username: string
  password: string
  confirmPassword: string
  notes: string
}

export default function RegistrationPage() {
  const router = useRouter()
  const [formValues, setFormValues] = useState<RegistrationForm>({
    fullName: "",
    username: "",
    password: "",
    confirmPassword: "",
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target
    setFormValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (formValues.password !== formValues.confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden")
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formValues.username.trim(),
          password: formValues.password,
        }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.error || "No fue posible registrar el usuario")
      }

      setSuccessMessage("Registro exitoso. Ya puedes iniciar sesión.")
      setFormValues({ fullName: "", username: "", password: "", confirmPassword: "", notes: "" })

      setTimeout(() => {
        router.push("/")
      }, 1200)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error inesperado"
      setErrorMessage(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-10">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <UserPlus className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Crear cuenta</h1>
          <p className="mt-2 text-muted-foreground text-balance">
            Registra un usuario para acceder al sistema de análisis de tomate.
          </p>
        </div>

        <Card className="border-0 bg-card/85 shadow-xl backdrop-blur">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="font-serif text-2xl">Información de acceso</CardTitle>
            <CardDescription>Ingresa tus datos para crear una cuenta.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-6" onSubmit={handleSubmit}>
              <div className="grid gap-2 text-left">
                <Label htmlFor="fullName">Nombre completo</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="Nombre y apellidos"
                  value={formValues.fullName}
                  onChange={handleChange}
                  required
                  className="h-11"
                />
              </div>

              <div className="grid gap-2 text-left">
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="usuario@example.com"
                  value={formValues.username}
                  onChange={handleChange}
                  required
                  className="h-11"
                />
              </div>

              <div className="grid gap-2 text-left">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Ingresa una contraseña segura"
                  value={formValues.password}
                  onChange={handleChange}
                  required
                  className="h-11"
                />
              </div>

              <div className="grid gap-2 text-left">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Repite la contraseña"
                  value={formValues.confirmPassword}
                  onChange={handleChange}
                  required
                  className="h-11"
                />
              </div>

              <div className="grid gap-2 text-left">
                <Label htmlFor="notes">Observaciones (opcional)</Label>
                <textarea
                  id="notes"
                  name="notes"
                  placeholder="Describe brevemente tu rol o motivos para solicitar acceso"
                  value={formValues.notes}
                  onChange={handleChange}
                  rows={4}
                  className="min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                />
              </div>

              {errorMessage && (
                <p className="text-sm text-destructive text-center">{errorMessage}</p>
              )}
              {successMessage && (
                <p className="text-sm text-emerald-600 text-center">{successMessage}</p>
              )}

              <Button
                type="submit"
                className="h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creando cuenta..." : "Registrarse"}
              </Button>
            </form>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                <Link href="/" className="font-medium text-primary hover:text-primary/80">
                  Volver al inicio de sesión
                </Link>
              </div>
              <Link href="/soporte" className="font-medium text-primary hover:text-primary/80">
                ¿Necesitas asistencia adicional?
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
