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

  // 🔥 Versión corregida: llama a tu backend real
  const handleAnalyze = async () => {
    if (!fileInputRef.current?.files?.[0]) return

    setIsAnalyzing(true)

    try {
      const formData = new FormData()
      formData.append("image", fileInputRef.current.files[0])

      // Llamada al backend Next.js → Flask
      const res = await fetch("/api/predict", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        throw new Error("Error en la conexión con el backend")
      }

      const data = await res.json()

      // Mapea los datos que devuelve Flask
      setAnalysisResult({
        disease: data.disease,
        confidence: data.confidence,
        severity: data.risk_level, // Flask devuelve "risk_level"
        symptoms: data.symptoms,
        treatment: data.treatment,
        prevention: data.prevention,
      })
    } catch (error) {
      console.error("❌ Error en el análisis:", error)
      alert("Error al procesar la imagen. Revisa que Flask esté corriendo en http://localhost:5000")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity?.toLowerCase()) {
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

          {/* Nuevo Análisis */}
          <TabsContent value="analyze" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Image Upload */}
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
                        <p className="text-sm font-medium">Arrastra una imagen aquí o haz clic</p>
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

              {/* Resultados */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Resultados del Análisis</span>
                  </CardTitle>
                  <CardDescription>Resultados reales del modelo Flask</CardDescription>
                </CardHeader>
                <CardContent>
                  {isAnalyzing ? (
                    <p className="text-center text-muted-foreground">Procesando imagen...</p>
                  ) : analysisResult ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div>
                          <h3 className="font-semibold text-lg">{analysisResult.disease}</h3>
                          <p className="text-sm text-muted-foreground">
                            Confianza: {analysisResult.confidence}%
                          </p>
                        </div>
                        <Badge variant={getSeverityBadge(analysisResult.severity)}>
                          {analysisResult.severity} riesgo
                        </Badge>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Síntomas</h4>
                        <p className="text-sm text-muted-foreground">{analysisResult.symptoms}</p>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Tratamiento</h4>
                        <p className="text-sm text-muted-foreground">{analysisResult.treatment}</p>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Prevención</h4>
                        <p className="text-sm text-muted-foreground">{analysisResult.prevention}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground">
                      Sube una imagen y presiona "Iniciar Análisis"
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
