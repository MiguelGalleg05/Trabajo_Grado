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
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Upload,
  Star,
  Camera,
  FileImage,
  Search,
  Award,
  BarChart3,
  CheckCircle,
  AlertCircle,
} from "lucide-react"

// Mock data for quality assessments
const mockQualityData = [
  {
    id: 1,
    batchId: "CAL-2024-156",
    quality: "Premium",
    score: 9.2,
    date: "2024-12-15",
    image: "/premium-tomato.jpg",
    characteristics: {
      color: 9.5,
      size: 8.8,
      firmness: 9.0,
      shape: 9.3,
      defects: 9.1,
    },
    notes: "Excelente coloración uniforme, tamaño consistente",
  },
  {
    id: 2,
    batchId: "CAL-2024-155",
    quality: "Estándar",
    score: 7.4,
    date: "2024-12-14",
    image: "/standard-tomato.jpg",
    characteristics: {
      color: 7.8,
      size: 7.2,
      firmness: 7.5,
      shape: 7.1,
      defects: 7.3,
    },
    notes: "Calidad aceptable, ligeras variaciones en tamaño",
  },
  {
    id: 3,
    batchId: "CAL-2024-154",
    quality: "Baja",
    score: 5.1,
    date: "2024-12-13",
    image: "/low-quality-tomato.jpg",
    characteristics: {
      color: 5.5,
      size: 4.8,
      firmness: 5.0,
      shape: 5.2,
      defects: 4.9,
    },
    notes: "Defectos visibles, coloración irregular",
  },
]

export default function QualityPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [qualityFilter, setQualityFilter] = useState("all")

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
        quality: "Premium",
        score: 8.7,
        characteristics: {
          color: 9.1,
          size: 8.5,
          firmness: 8.8,
          shape: 8.6,
          defects: 8.4,
        },
        classification: "Grado A",
        marketValue: "Alto",
        recommendations: ["Excelente para mercado premium", "Mantener cadena de frío", "Empacar con cuidado especial"],
      })
      setIsAnalyzing(false)
    }, 3000)
  }

  const getQualityColor = (quality: string) => {
    switch (quality.toLowerCase()) {
      case "premium":
        return "text-green-600"
      case "estándar":
        return "text-accent"
      case "baja":
        return "text-destructive"
      default:
        return "text-muted-foreground"
    }
  }

  const getQualityBadge = (quality: string) => {
    switch (quality.toLowerCase()) {
      case "premium":
        return "default"
      case "estándar":
        return "secondary"
      case "baja":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600"
    if (score >= 6) return "text-accent"
    return "text-destructive"
  }

  const filteredQuality = mockQualityData.filter((item) => {
    const matchesSearch = item.batchId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesQuality = qualityFilter === "all" || item.quality.toLowerCase() === qualityFilter
    return matchesSearch && matchesQuality
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
                <div className="bg-accent/10 rounded-lg p-2">
                  <Star className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h1 className="text-xl font-serif font-bold text-foreground">Módulo de Calidad</h1>
                  <p className="text-sm text-muted-foreground">Evaluación y clasificación de calidad</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="evaluate" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="evaluate">Nueva Evaluación</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
            <TabsTrigger value="analytics">Análisis</TabsTrigger>
          </TabsList>

          {/* New Evaluation Tab */}
          <TabsContent value="evaluate" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Image Upload Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Camera className="h-5 w-5" />
                    <span>Cargar Muestra</span>
                  </CardTitle>
                  <CardDescription>Sube una imagen del tomate para evaluar su calidad automáticamente</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    {selectedImage ? (
                      <div className="space-y-4">
                        <img
                          src={selectedImage || "/placeholder.svg"}
                          alt="Muestra seleccionada"
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
                      <Label htmlFor="batch-id">ID de Lote</Label>
                      <Input id="batch-id" placeholder="CAL-2024-XXX" />
                    </div>

                    <div>
                      <Label htmlFor="variety">Variedad</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar variedad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cherry">Cherry</SelectItem>
                          <SelectItem value="roma">Roma</SelectItem>
                          <SelectItem value="beefsteak">Beefsteak</SelectItem>
                          <SelectItem value="heirloom">Heirloom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="harvest-date">Fecha de Cosecha</Label>
                      <Input id="harvest-date" type="date" />
                    </div>

                    <div>
                      <Label htmlFor="notes">Observaciones</Label>
                      <Textarea
                        id="notes"
                        placeholder="Describe características especiales o condiciones de la muestra..."
                        rows={3}
                      />
                    </div>
                  </div>

                  <Button className="w-full" onClick={handleAnalyze} disabled={!selectedImage || isAnalyzing}>
                    {isAnalyzing ? "Evaluando..." : "Iniciar Evaluación"}
                  </Button>
                </CardContent>
              </Card>

              {/* Analysis Results Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5" />
                    <span>Resultados de Calidad</span>
                  </CardTitle>
                  <CardDescription>Evaluación automática de características de calidad</CardDescription>
                </CardHeader>
                <CardContent>
                  {isAnalyzing ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="text-sm text-muted-foreground">Evaluando calidad...</p>
                      </div>
                    </div>
                  ) : analysisResult ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div>
                          <h3 className="font-semibold text-lg">{analysisResult.quality}</h3>
                          <p className="text-sm text-muted-foreground">
                            Puntuación: {analysisResult.score}/10 • {analysisResult.classification}
                          </p>
                        </div>
                        <Badge variant={getQualityBadge(analysisResult.quality)}>
                          {analysisResult.marketValue} valor
                        </Badge>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-medium">Características evaluadas</h4>
                        {Object.entries(analysisResult.characteristics).map(([key, value]) => (
                          <div key={key} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="capitalize">{key === "defects" ? "Sin defectos" : key}</span>
                              <span className={getScoreColor(value as number)}>{value}/10</span>
                            </div>
                            <Progress value={(value as number) * 10} className="h-2" />
                          </div>
                        ))}
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Recomendaciones</h4>
                        <ul className="space-y-1">
                          {analysisResult.recommendations.map((rec: string, index: number) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-start space-x-2">
                              <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex space-x-2">
                        <Button className="flex-1">Guardar Evaluación</Button>
                        <Button variant="outline" className="flex-1 bg-transparent">
                          Generar Certificado
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center space-y-2">
                        <Star className="h-12 w-12 text-muted-foreground mx-auto" />
                        <p className="text-sm text-muted-foreground">Sube una imagen para comenzar la evaluación</p>
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
                  placeholder="Buscar por ID de lote..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={qualityFilter} onValueChange={setQualityFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por calidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las calidades</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="estándar">Estándar</SelectItem>
                  <SelectItem value="baja">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuality.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{item.batchId}</CardTitle>
                      <Badge variant={getQualityBadge(item.quality)}>{item.quality}</Badge>
                    </div>
                    <CardDescription>
                      Puntuación: {item.score}/10 • {item.date}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.batchId}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span>Color:</span>
                          <span className={getScoreColor(item.characteristics.color)}>
                            {item.characteristics.color}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tamaño:</span>
                          <span className={getScoreColor(item.characteristics.size)}>{item.characteristics.size}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Firmeza:</span>
                          <span className={getScoreColor(item.characteristics.firmness)}>
                            {item.characteristics.firmness}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Forma:</span>
                          <span className={getScoreColor(item.characteristics.shape)}>
                            {item.characteristics.shape}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{item.notes}</p>
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

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Evaluaciones</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">189</div>
                  <p className="text-xs text-muted-foreground">+8% desde el mes pasado</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Calidad Promedio</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">7.8/10</div>
                  <p className="text-xs text-muted-foreground">+0.2 puntos esta semana</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Calidad Premium</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">45%</div>
                  <p className="text-xs text-muted-foreground">Del total de evaluaciones</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rechazos</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12%</div>
                  <p className="text-xs text-muted-foreground">Calidad por debajo del estándar</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distribución de Calidad</CardTitle>
                  <CardDescription>Porcentaje por categoría de calidad</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Premium</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: "45%" }}></div>
                        </div>
                        <span className="text-sm text-muted-foreground">45%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Estándar</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div className="bg-accent h-2 rounded-full" style={{ width: "43%" }}></div>
                        </div>
                        <span className="text-sm text-muted-foreground">43%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Baja</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div className="bg-destructive h-2 rounded-full" style={{ width: "12%" }}></div>
                        </div>
                        <span className="text-sm text-muted-foreground">12%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Características Promedio</CardTitle>
                  <CardDescription>Puntuación promedio por característica</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "Color", score: 8.2 },
                      { name: "Tamaño", score: 7.8 },
                      { name: "Firmeza", score: 7.9 },
                      { name: "Forma", score: 8.0 },
                      { name: "Sin defectos", score: 7.6 },
                    ].map((item) => (
                      <div key={item.name} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{item.name}</span>
                          <span className={getScoreColor(item.score)}>{item.score}/10</span>
                        </div>
                        <Progress value={item.score * 10} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
