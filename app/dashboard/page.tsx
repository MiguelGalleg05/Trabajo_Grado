"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Leaf, Activity, FileText, LogOut, Microscope, Star, TrendingUp, Calendar } from "lucide-react"

export default function DashboardPage() {
  const [username, setUsername] = useState("")
  const router = useRouter()

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    const storedUsername = localStorage.getItem("username")

    if (!isAuthenticated) {
      router.push("/")
      return
    }

    if (storedUsername) {
      setUsername(storedUsername)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("username")
    router.push("/")
  }

  const navigateToModule = (module: string) => {
    router.push(`/dashboard/${module}`)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-primary rounded-lg p-2">
                <Leaf className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-serif font-bold text-foreground">Sistema de Análisis</h1>
                <p className="text-sm text-muted-foreground">Dashboard Principal</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">Bienvenido, {username}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-2">Panel de Control</h2>
          <p className="text-muted-foreground text-balance">
            Gestiona y analiza datos de enfermedades y calidad en hojas de tomate
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Análisis Realizados</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">247</div>
              <p className="text-xs text-muted-foreground">+12% desde el mes pasado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enfermedades Detectadas</CardTitle>
              <Microscope className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18</div>
              <p className="text-xs text-muted-foreground">En las últimas 2 semanas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Calidad Promedio</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8.4/10</div>
              <p className="text-xs text-muted-foreground">+0.3 puntos esta semana</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Precisión del Sistema</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94.2%</div>
              <p className="text-xs text-muted-foreground">Basado en validaciones</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Modules */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Disease Module */}
          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigateToModule("diseases")}
          >
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 rounded-lg p-3">
                  <Microscope className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl font-serif">Módulo de Enfermedades</CardTitle>
                  <CardDescription>Detección y análisis de enfermedades en hojas de tomate</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Últimos análisis</span>
                  <Badge variant="secondary">23 nuevos</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Tizón tardío</span>
                    <span className="text-destructive">Alto riesgo</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Mancha bacteriana</span>
                    <span className="text-accent">Medio riesgo</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Virus del mosaico</span>
                    <span className="text-green-600">Bajo riesgo</span>
                  </div>
                </div>
                <Button className="w-full mt-4 bg-transparent" variant="outline">
                  Acceder al Módulo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quality Module */}
          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigateToModule("quality")}
          >
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="bg-accent/10 rounded-lg p-3">
                  <Star className="h-8 w-8 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-xl font-serif">Módulo de Calidad</CardTitle>
                  <CardDescription>Clasificación y evaluación de calidad del tomate</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Evaluaciones recientes</span>
                  <Badge variant="secondary">15 nuevas</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Calidad Premium</span>
                    <span className="text-green-600">45%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Calidad Estándar</span>
                    <span className="text-accent">35%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Calidad Baja</span>
                    <span className="text-destructive">20%</span>
                  </div>
                </div>
                <Button className="w-full mt-4 bg-transparent" variant="outline">
                  Acceder al Módulo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Actividad Reciente</span>
            </CardTitle>
            <CardDescription>Últimas acciones realizadas en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50">
                <div className="bg-primary/10 rounded-full p-2">
                  <Microscope className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Análisis de enfermedad completado</p>
                  <p className="text-xs text-muted-foreground">Muestra #TOM-2024-156 - Hace 2 horas</p>
                </div>
                <Badge variant="outline">Completado</Badge>
              </div>

              <div className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50">
                <div className="bg-accent/10 rounded-full p-2">
                  <Star className="h-4 w-4 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Evaluación de calidad procesada</p>
                  <p className="text-xs text-muted-foreground">Lote #CAL-2024-089 - Hace 4 horas</p>
                </div>
                <Badge variant="outline">Procesado</Badge>
              </div>

              <div className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50">
                <div className="bg-green-100 rounded-full p-2">
                  <FileText className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Reporte mensual generado</p>
                  <p className="text-xs text-muted-foreground">Informe de noviembre - Hace 1 día</p>
                </div>
                <Badge variant="outline">Generado</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
