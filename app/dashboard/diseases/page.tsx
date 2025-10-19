"use client"

import type React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { translateDiseaseLabel } from "@/lib/labels"
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
  History,
  BarChart3,
  Trash2,
} from "lucide-react"

type SeverityKey = "alto" | "medio" | "bajo" | "otros"

type AnalysisRecord = {
  id: string
  timestamp: string
  sampleId: string
  location: string
  notes: string
  disease: string
  confidence: number
  severity: SeverityKey
  symptoms: string
  treatment: string
  prevention: string
}

const STORAGE_KEY = "diseaseHistory"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api"

const removeDiacritics = (value: string) =>
  value.normalize("NFD").replace(/\p{Diacritic}/gu, "")

const parseSeverity = (value: string | null | undefined): SeverityKey => {
  const normalized = removeDiacritics(String(value ?? "")).toLowerCase().replace(/_/g, " ")
  if (normalized.includes("alto")) return "alto"
  if (normalized.includes("medio")) return "medio"
  if (normalized.includes("bajo")) return "bajo"
  return "otros"
}

const formatSeverityLabel = (severity: SeverityKey) => {
  switch (severity) {
    case "alto":
      return "Riesgo alto"
    case "medio":
      return "Riesgo medio"
    case "bajo":
      return "Riesgo bajo"
    default:
      return "Sin clasificación"
  }
}

const parseConfidence = (value: unknown) => {
  const numeric = Number(String(value ?? "").replace(/[^0-9.,-]/g, "").replace(",", "."))
  if (!Number.isFinite(numeric)) return 0
  return Math.min(Math.max(numeric, 0), 100)
}

export default function DiseasesPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<AnalysisRecord | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [severityFilter, setSeverityFilter] = useState<"all" | SeverityKey>("all")
  const [sampleId, setSampleId] = useState("")
  const [location, setLocation] = useState("")
  const [notes, setNotes] = useState("")
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisRecord[]>([])
  const [analysisFile, setAnalysisFile] = useState<File | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isCameraLoading, setIsCameraLoading] = useState(false)
  const [isCameraReady, setIsCameraReady] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }
    const storedUserId = sessionStorage.getItem("userId")
    setUserId(storedUserId)
  }, [])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as Array<Omit<AnalysisRecord, "severity"> & { severity: string }>
        const normalized = parsed.map((entry) => ({
          ...entry,
          disease: translateDiseaseLabel(entry.disease),
          severity: parseSeverity(entry.severity),
        }))
        setAnalysisHistory(normalized)
      }
    } catch (error) {
      console.error("Error al cargar el historial de análisis", error)
    }
  }, [])

  useEffect(() => {
    if (analysisHistory.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(analysisHistory))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [analysisHistory])

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    if (isCameraActive) {
      stopCamera()
    }

    setAnalysisFile(file)
    setCameraError(null)

    const reader = new FileReader()
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    if (event.target) {
      event.target.value = ""
    }
  }

  const startCamera = async () => {
    if (isCameraActive || isCameraLoading) {
      return
    }

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setCameraError("La camara no esta disponible en este dispositivo.")
      return
    }

    try {
      setCameraError(null)
      setIsCameraLoading(true)
      setIsCameraReady(false)
      setIsCameraActive(true)

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      streamRef.current = stream

      await new Promise<void>((resolve) => {
        if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
          window.requestAnimationFrame(() => resolve())
        } else {
          resolve()
        }
      })
      const videoElement = videoRef.current

      if (!videoElement) {
        throw new Error("No se pudo inicializar el elemento de video")
      }

      videoElement.srcObject = stream

      try {
        await videoElement.play()
      } catch (playError) {
        console.error("No se pudo reproducir el stream de la camara", playError)
        throw playError
      }

      if (videoElement.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        await new Promise<void>((resolve) => {
          const handleLoadedData = () => {
            videoElement.removeEventListener("loadeddata", handleLoadedData)
            resolve()
          }
          videoElement.addEventListener("loadeddata", handleLoadedData)
        })
      }

      setIsCameraReady(true)
    } catch (error) {
      console.error("Error al iniciar la camara", error)
      setCameraError("No se pudo acceder a la camara. Verifica los permisos del navegador.")
      stopCamera()
    } finally {
      setIsCameraLoading(false)
    }
  }

  const stopCamera = () => {
    const stream = streamRef.current
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
    }
    streamRef.current = null
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsCameraActive(false)
    setIsCameraReady(false)
    setIsCameraLoading(false)
  }

  const capturePhoto = () => {
    const video = videoRef.current
    if (!video) {
      return
    }

    if (!isCameraReady || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      setCameraError("La camara se esta inicializando. Intenta nuevamente en un momento.")
      return
    }

    const canvas = document.createElement("canvas")
    const width = video.videoWidth || 640
    const height = video.videoHeight || 480
    canvas.width = width
    canvas.height = height

    const context = canvas.getContext("2d")
    if (!context) {
      setCameraError("No se pudo capturar la imagen.")
      return
    }

    context.drawImage(video, 0, 0, width, height)
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92)
    setSelectedImage(dataUrl)

    canvas.toBlob((blob) => {
      if (!blob) {
        setCameraError("No se pudo capturar la imagen.")
        return
      }

      const file = new File([blob], `captura-enfermedad-${Date.now()}.jpg`, { type: "image/jpeg" })
      setAnalysisFile(file)
      setCameraError(null)
      stopCamera()
      void analyzeImageFile(file)
    }, "image/jpeg", 0.92)
  }

  const createHistoryEntry = (data: {
    disease: string
    confidence: number
    severity: string
    symptoms: string
    treatment: string
    prevention: string
  }): AnalysisRecord => {
    const generatedSampleId = sampleId.trim() || `TOM-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`
    return {
      id: globalThis.crypto?.randomUUID?.() ?? `history-${Date.now()}`,
      timestamp: new Date().toISOString(),
      sampleId: generatedSampleId,
      location: location.trim(),
      notes: notes.trim(),
      disease: translateDiseaseLabel(data.disease),
      confidence: parseConfidence(data.confidence),
      severity: parseSeverity(data.severity),
      symptoms: data.symptoms || "No disponible",
      treatment: data.treatment || "No disponible",
      prevention: data.prevention || "No disponible",
    }
  }

  const persistDiseaseRecord = async (record: AnalysisRecord) => {
    if (typeof window === "undefined") {
      return
    }

    const storedUserId = userId ?? sessionStorage.getItem("userId")
    if (!storedUserId) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/records/disease`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: Number(storedUserId),
          timestamp: record.timestamp,
          sampleId: record.sampleId,
          location: record.location,
          notes: record.notes,
          disease: record.disease,
          confidence: record.confidence,
          severity: record.severity,
          symptoms: record.symptoms,
          treatment: record.treatment,
          prevention: record.prevention,
        }),
      })

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}))
        console.warn("No se pudo registrar el análisis de enfermedad", errorPayload)
      }
    } catch (error) {
      console.error("Error al guardar el análisis de enfermedad", error)
    }
  }

  const analyzeImageFile = async (file: File) => {
    if (isAnalyzing) {
      return
    }

    setIsAnalyzing(true)

    try {
      const formData = new FormData()
      formData.append("image", file)

      const res = await fetch("/api/predict", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const text = await res.text().catch(() => "")
        throw new Error(text || "Error en la conexion con el backend")
      }

      const data = await res.json()

      const historyEntry = createHistoryEntry({
        disease: data.disease,
        confidence: data.confidence,
        severity: data.risk_level ?? data.severity,
        symptoms: data.symptoms,
        treatment: data.treatment,
        prevention: data.prevention,
      })

      setAnalysisResult(historyEntry)
      setAnalysisHistory((prev) => [historyEntry, ...prev])
      void persistDiseaseRecord(historyEntry)
    } catch (error) {
      console.error("Error en el analisis:", error)
      alert("Error al procesar la imagen. Verifica que el backend este disponible.")
    } finally {
      setIsAnalyzing(false)
    }
  }


  const handleAnalyze = () => {
    if (!analysisFile) {
      alert("Selecciona o captura una imagen antes de analizar.")
      return
    }

    void analyzeImageFile(analysisFile)
  }

  const getSeverityBadge = (severity: SeverityKey) => {
    switch (severity) {
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

  const getSeverityIcon = (severity: SeverityKey | "alto" | "medio" | "bajo" | "otros") => {
    switch (severity) {
      case "alto":
        return <AlertTriangle className="h-4 w-4 text-destructive" />
      case "medio":
        return <XCircle className="h-4 w-4 text-accent" />
      case "bajo":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />
      default:
        return <Microscope className="h-4 w-4 text-muted-foreground" />
    }
  }

  const filteredHistory = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    const severity = severityFilter.toLowerCase()

    return analysisHistory.filter((entry) => {
      const matchesSeverity = severity === "all" || entry.severity === severity
      const matchesTerm =
        !term ||
        [entry.sampleId, entry.disease, entry.location]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(term))
      return matchesSeverity && matchesTerm
    })
  }, [analysisHistory, searchTerm, severityFilter])

  const statistics = useMemo(() => {
    const total = analysisHistory.length
    const severityCounts = analysisHistory.reduce(
      (acc, entry) => {
        acc[entry.severity] += 1
        return acc
      },
      { alto: 0, medio: 0, bajo: 0, otros: 0 },
    )

    const averageConfidence =
      total === 0
        ? 0
        : analysisHistory.reduce((sum, entry) => sum + entry.confidence, 0) / total

    const diseaseFrequency = analysisHistory.reduce<Record<string, number>>((acc, entry) => {
      const label = translateDiseaseLabel(entry.disease)
      acc[label] = (acc[label] ?? 0) + 1
      return acc
    }, {})

    const mostCommonDisease = Object.entries(diseaseFrequency).sort(
      (a, b) => b[1] - a[1],
    )[0]?.[0] ?? null

    return {
      total,
      severityCounts,
      averageConfidence,
      mostCommonDisease,
      latest: analysisHistory[0] ?? null,
    }
  }, [analysisHistory])

  const handleClearHistory = () => {
    if (window.confirm("¿Deseas eliminar todo el historial de análisis?")) {
      setAnalysisHistory([])
      setAnalysisResult(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="analyze" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analyze">Nuevo Análisis</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
            <TabsTrigger value="statistics">Estadísticas</TabsTrigger>
          </TabsList>

          <TabsContent value="analyze" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

                  <div className="space-y-3">
                    {cameraError ? (
                      <p className="text-sm text-destructive text-center">{cameraError}</p>
                    ) : null}
                    {isCameraActive ? (
                      <div className="space-y-3">
                        <div className="relative">
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full max-h-64 rounded-lg border border-border bg-black/40"
                          />
                          {!isCameraReady && !cameraError ? (
                            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/80 text-sm text-muted-foreground">
                              {isCameraLoading ? "Inicializando camara..." : "Esperando imagen de la camara..."}
                            </div>
                          ) : null}
                        </div>
                        <div className="flex flex-wrap justify-center gap-3">
                          <Button
                            onClick={capturePhoto}
                            className="flex-1 min-w-[140px]"
                            disabled={!isCameraReady || isAnalyzing}
                          >
                            <Camera className="h-4 w-4 mr-2" /> Capturar foto
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setCameraError(null)
                              stopCamera()
                            }}
                            className="flex-1 min-w-[140px]"
                            disabled={isCameraLoading}
                          >
                            Cerrar camara
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="secondary"
                        onClick={startCamera}
                        className="w-full"
                        disabled={isCameraLoading || isAnalyzing}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        {isCameraLoading ? "Inicializando camara..." : "Usar camara del dispositivo"}
                      </Button>
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
                      <Input
                        id="sample-id"
                        placeholder="TOM-2025-001"
                        value={sampleId}
                        onChange={(event) => setSampleId(event.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="location">Ubicación</Label>
                      <Input
                        id="location"
                        placeholder="Invernadero A, Sector 3"
                        value={location}
                        onChange={(event) => setLocation(event.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="notes">Observaciones</Label>
                      <Textarea
                        id="notes"
                        placeholder="Describe síntomas visibles, condiciones ambientales u otra información relevante..."
                        rows={3}
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                      />
                    </div>
                  </div>

                  <Button className="w-full" onClick={handleAnalyze} disabled={!analysisFile || isAnalyzing}>
                    {isAnalyzing ? "Analizando..." : "Iniciar Análisis"}
                  </Button>
                </CardContent>
              </Card>

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
                            Confianza: {analysisResult.confidence.toFixed(1)}%
                          </p>
                        </div>
                        <Badge variant={getSeverityBadge(analysisResult.severity)}>
                          {formatSeverityLabel(analysisResult.severity)}
                        </Badge>
                      </div>

                      <div className="grid gap-2 rounded-lg border border-border p-4 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium text-muted-foreground">ID de muestra</span>
                          <span>{analysisResult.sampleId}</span>
                        </div>
                        {analysisResult.location && (
                          <div className="flex justify-between">
                            <span className="font-medium text-muted-foreground">Ubicación</span>
                            <span>{analysisResult.location}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="font-medium text-muted-foreground">Fecha</span>
                          <span>{new Date(analysisResult.timestamp).toLocaleString()}</span>
                        </div>
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

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <History className="h-5 w-5" />
                    <span>Historial de análisis</span>
                  </CardTitle>
                  <CardDescription>
                    Consulta los resultados anteriores y realiza seguimiento a las incidencias detectadas.
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={handleClearHistory} disabled={analysisHistory.length === 0}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpiar historial
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-[2fr,1fr]">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por muestra, enfermedad o ubicación..."
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      className="h-10 pl-9"
                    />
                  </div>
                  <Select value={severityFilter} onValueChange={(value: SeverityKey | "all") => setSeverityFilter(value)}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Filtrar por severidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las severidades</SelectItem>
                      <SelectItem value="alto">Riesgo alto</SelectItem>
                      <SelectItem value="medio">Riesgo medio</SelectItem>
                      <SelectItem value="bajo">Riesgo bajo</SelectItem>
                      <SelectItem value="otros">Sin clasificación</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {filteredHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No hay registros que coincidan con la búsqueda.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {filteredHistory.map((entry) => (
                      <div
                        key={entry.id}
                        className="rounded-xl border border-border bg-card/80 p-4 shadow-sm"
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div className="flex items-center gap-3">
                            {getSeverityIcon(entry.severity)}
                            <div>
                              <p className="font-semibold text-foreground">
                                {entry.disease}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Analizado el {new Date(entry.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <Badge variant={getSeverityBadge(entry.severity)}>{formatSeverityLabel(entry.severity)}</Badge>
                        </div>

                        <div className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
                          <div>
                            <span className="font-medium text-foreground">Muestra:</span> {entry.sampleId}
                          </div>
                          {entry.location && (
                            <div>
                              <span className="font-medium text-foreground">Ubicación:</span> {entry.location}
                            </div>
                          )}
                          <div>
                            <span className="font-medium text-foreground">Confianza:</span> {entry.confidence.toFixed(1)}%
                          </div>
                        </div>

                        {entry.notes && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">Notas:</span> {entry.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="statistics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Resumen estadístico</span>
                </CardTitle>
                <CardDescription>
                  Indicadores generados con base en los análisis registrados en el historial.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {statistics.total === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Aún no hay datos suficientes para mostrar estadísticas. Realiza un análisis para comenzar.
                  </p>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <Card className="bg-muted/40">
                        <CardHeader className="space-y-1">
                          <CardTitle className="text-sm font-medium">Total de análisis</CardTitle>
                          <CardDescription>Acumulado en esta sesión</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-3xl font-semibold">{statistics.total}</p>
                          {statistics.latest && (
                            <p className="text-xs text-muted-foreground">
                              Último: {statistics.latest.disease} ({new Date(statistics.latest.timestamp).toLocaleDateString()})
                            </p>
                          )}
                        </CardContent>
                      </Card>

                      <Card className="bg-muted/40">
                        <CardHeader className="space-y-1">
                          <CardTitle className="text-sm font-medium">Casos de alto riesgo</CardTitle>
                          <CardDescription>Detecciones prioritarias</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-3xl font-semibold">{statistics.severityCounts.alto}</p>
                          <p className="text-xs text-muted-foreground">
                            {Math.round((statistics.severityCounts.alto / statistics.total) * 100)}% del total
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="bg-muted/40">
                        <CardHeader className="space-y-1">
                          <CardTitle className="text-sm font-medium">Confianza promedio</CardTitle>
                          <CardDescription>Precisión del modelo</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-3xl font-semibold">{statistics.averageConfidence.toFixed(1)}%</p>
                        </CardContent>
                      </Card>

                      <Card className="bg-muted/40">
                        <CardHeader className="space-y-1">
                          <CardTitle className="text-sm font-medium">Enfermedad recurrente</CardTitle>
                          <CardDescription>La más detectada</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-lg font-semibold">
                            {statistics.mostCommonDisease ?? "Sin datos"}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Card className="bg-muted/30">
                        <CardHeader>
                          <CardTitle className="text-base">Distribución por severidad</CardTitle>
                          <CardDescription>Clasificación de los últimos análisis</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {(["alto", "medio", "bajo", "otros"] as const).map((level) => (
                            <div key={level} className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm">
                                {getSeverityIcon(level)}
                                <span className="capitalize">{formatSeverityLabel(level)}</span>
                              </div>
                              <span className="text-sm font-medium">
                                {statistics.severityCounts[level]} casos
                              </span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      <Card className="bg-muted/30">
                        <CardHeader>
                          <CardTitle className="text-base">Último análisis</CardTitle>
                          <CardDescription>Detalles resumidos</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {statistics.latest ? (
                            <div className="space-y-2 text-sm text-muted-foreground">
                              <p>
                                <span className="font-medium text-foreground">Enfermedad:</span> {statistics.latest.disease}
                              </p>
                              <p>
                                <span className="font-medium text-foreground">Confianza:</span> {statistics.latest.confidence.toFixed(1)}%
                              </p>
                              <p>
                                <span className="font-medium text-foreground">Muestra:</span> {statistics.latest.sampleId}
                              </p>
                              <p>
                                <span className="font-medium text-foreground">Severidad:</span> {formatSeverityLabel(statistics.latest.severity)}
                              </p>
                              <p>
                                <span className="font-medium text-foreground">Fecha:</span> {new Date(statistics.latest.timestamp).toLocaleString()}
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">Aún no hay datos registrados.</p>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
