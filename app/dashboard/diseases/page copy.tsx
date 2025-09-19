"use client"

import type React from "react"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Upload,
  Microscope,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Camera,
  FileImage,
  Search,
  TrendingUp,
} from "lucide-react"

// Mock data for diseases
const mockDiseases = [
  {
    id: 1,
    name: "Tizón tardío",
    severity: "Alto",
    confidence: 94.2,
    date: "2024-12-15",
    image: "/tomato-leaf-disease.jpg",
    symptoms: "Manchas marrones con bordes amarillos, esporulación blanca",
    treatment: "Aplicar fungicida cúprico, mejorar ventilación",
  },
  {
    id: 2,
    name: "Mancha bacteriana",
    severity: "Medio",
    confidence: 87.5,
    date: "2024-12-14",
    image: "/bacterial-spot-tomato.jpg",
    symptoms: "Pequeñas manchas negras con halo amarillo",
    treatment: "Aplicar bactericida, reducir humedad",
  },
  {
    id: 3,
    name: "Virus del mosaico",
    severity: "Bajo",
    confidence: 91.8,
    date: "2024-12-13",
    image: "/mosaic-virus-tomato.jpg",
    symptoms: "Patrón de mosaico verde claro y oscuro",
    treatment: "Eliminar plantas infectadas, control de vectores",
  },
]

export default function DiseasesPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [severityFilter, setSeverityFilter] = useState("all")

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAnalyze = () => {
    if (!selectedImage) return

    setIsAnalyzing(true)
    // Simulate analysis
    setTimeout(() => {
      setAnalysisResult({
        disease: "Tizón tardío",
        confidence: 92.3,
        severity: "Alto",
        symptoms:
          "Manchas marrones irregulares con bordes amarillos, presencia de esporulación blanca en el envés de la hoja",
        treatment:
          "Aplicar fungicida sistémico a base de cobre, mejorar la ventilación del cultivo, reducir la humedad relativa",
        prevention: "Rotación de cultivos, uso de variedades resistentes, manejo adecuado del riego",
      })
      setIsAnalyzing(false)
    }, 3000)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "alto":
        return "text-destructive"
      case "medio":
        return "text-accent"
      case "bajo":
        return "text-green-600"
      default:
        return "text-muted-foreground"
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "alto":
        return "destructive"
      case "medio":
        return "secondary"
      case "bajo":
        return "outline"
      default:
        return "outline"
    }
  }

  const filteredDiseases = mockDiseases.filter((disease) => {
    const matchesSearch = disease.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSeverity = severityFilter === "all" || disease.severity.toLowerCase() === severityFilter
    return matchesSearch && matchesSeverity
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 rounded-lg p-2">
                  <Microscope className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-serif font-bold text-foreground">Módulo de Enfermedades</h1>
                  <p className="text-sm text-muted-foreground">Detección y análisis de enfermedades</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="analyze" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analyze">Nuevo Análisis</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
            <TabsTrigger value="statistics">Estadísticas</TabsTrigger>
          </TabsList>

          {/* New Analysis Tab */}
          <TabsContent value="analyze" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Image Upload Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Camera className="h-5 w-5" />
                    <span>Cargar Imagen</span>
                  </CardTitle>
                  <CardDescription>
                    Sube una imagen de la hoja de tomate para analizar posibles enfermedades
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    {selectedImage ? (
                      <div className="space-y-4">
                        <img
                          src={selectedImage || "/placeholder.svg"}
                          alt="Imagen seleccionada"
                          className="max-w-full h-48 object-contain mx-auto rounded-lg"
                        />
                        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                          <FileImage className="h-4 w-4 mr-2" />
                          Cambiar imagen
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                        <div>
                          <p className="text-sm font-medium">Arrastra una imagen aquí</p>
                          <p className="text-xs text-muted-foreground">o haz clic para seleccionar</p>
                        </div>
                        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                          Seleccionar archivo
                        </Button>
                      </div>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="sample-id">ID de Muestra</Label>
                      <Input id="sample-id" placeholder="TOM-2024-XXX" />
                    </div>

                    <div>
                      <Label htmlFor="location">Ubicación</Label>
                      <Input id="location" placeholder="Invernadero A, Sector 3" />
                    </div>

                    <div>
                      <Label htmlFor="notes">Observaciones</Label>
                      <Textarea
                        id="notes"
                        placeholder="Describe cualquier síntoma visible o condición especial..."
                        rows={3}
                      />
                    </div>
                  </div>

                  <Button className="w-full" onClick={handleAnalyze} disabled={!selectedImage || isAnalyzing}>
                    {isAnalyzing ? "Analizando..." : "Iniciar Análisis"}
                  </Button>
                </CardContent>
              </Card>

              {/* Analysis Results Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Resultados del Análisis</span>
                  </CardTitle>
                  <CardDescription>Resultados de la detección automática de enfermedades</CardDescription>
                </CardHeader>
                <CardContent>
                  {isAnalyzing ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="text-sm text-muted-foreground">Procesando imagen...</p>
                      </div>
                    </div>
                  ) : analysisResult ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div>
                          <h3 className="font-semibold text-lg">{analysisResult.disease}</h3>
                          <p className="text-sm text-muted-foreground">Confianza: {analysisResult.confidence}%</p>
                        </div>
                        <Badge variant={getSeverityBadge(analysisResult.severity)}>
                          {analysisResult.severity} riesgo
                        </Badge>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Síntomas identificados</h4>
                          <p className="text-sm text-muted-foreground">{analysisResult.symptoms}</p>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Tratamiento recomendado</h4>
                          <p className="text-sm text-muted-foreground">{analysisResult.treatment}</p>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Prevención</h4>
                          <p className="text-sm text-muted-foreground">{analysisResult.prevention}</p>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button className="flex-1">Guardar Resultado</Button>
                        <Button variant="outline" className="flex-1 bg-transparent">
                          Generar Reporte
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center space-y-2">
                        <Microscope className="h-12 w-12 text-muted-foreground mx-auto" />
                        <p className="text-sm text-muted-foreground">Sube una imagen para comenzar el análisis</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre de enfermedad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por severidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las severidades</SelectItem>
                  <SelectItem value="alto">Alto riesgo</SelectItem>
                  <SelectItem value="medio">Medio riesgo</SelectItem>
                  <SelectItem value="bajo">Bajo riesgo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDiseases.map((disease) => (
                <Card key={disease.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{disease.name}</CardTitle>
                      <Badge variant={getSeverityBadge(disease.severity)}>{disease.severity}</Badge>
                    </div>
                    <CardDescription>
                      Confianza: {disease.confidence}% • {disease.date}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <img
                      src={disease.image || "/placeholder.svg"}
                      alt={disease.name}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div className="space-y-2">
                      <div>
                        <h5 className="text-sm font-medium">Síntomas</h5>
                        <p className="text-xs text-muted-foreground">{disease.symptoms}</p>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium">Tratamiento</h5>
                        <p className="text-xs text-muted-foreground">{disease.treatment}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      Ver detalles
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="statistics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Análisis</CardTitle>
                  <Microscope className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">247</div>
                  <p className="text-xs text-muted-foreground">+12% desde el mes pasado</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Enfermedades Detectadas</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">18</div>
                  <p className="text-xs text-muted-foreground">En las últimas 2 semanas</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Precisión Promedio</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">94.2%</div>
                  <p className="text-xs text-muted-foreground">Basado en validaciones</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Casos Críticos</CardTitle>
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">Requieren atención inmediata</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Distribución de Enfermedades</CardTitle>
                <CardDescription>Frecuencia de detección por tipo de enfermedad</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tizón tardío</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div className="bg-destructive h-2 rounded-full" style={{ width: "45%" }}></div>
                      </div>
                      <span className="text-sm text-muted-foreground">45%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Mancha bacteriana</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div className="bg-accent h-2 rounded-full" style={{ width: "30%" }}></div>
                      </div>
                      <span className="text-sm text-muted-foreground">30%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Virus del mosaico</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: "25%" }}></div>
                      </div>
                      <span className="text-sm text-muted-foreground">25%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
