"use client"

import { translateQualityLabel } from "@/lib/labels"

import type React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
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
  Sparkles,
  Trash2,
  Images,
  Download,
} from "lucide-react"

const QUALITY_STORAGE_KEY = "qualityHistory"
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api"

type Detection = {
  class: string
  confidence: number
  bbox: number[]
}

type QualityRecord = {
  id: string
  timestamp: string
  batchId: string
  notes: string
  annotatedImage: string | null
  detections: Detection[]
  total: number
  classCounts: Record<string, number>
}

type StoredQualityRecord = Omit<QualityRecord, "annotatedImage">

const serializeHistory = (history: QualityRecord[]) =>
  JSON.stringify(
    history.map(({ annotatedImage, ...record }) => record) as StoredQualityRecord[],
  )

const parseStoredHistory = (value: string): QualityRecord[] => {
  const parsed = JSON.parse(value) as StoredQualityRecord[]
  return parsed.map((entry) => ({
    ...entry,
    annotatedImage: null,
  }))
}

const isQuotaExceededError = (error: unknown) =>
  typeof window !== "undefined" &&
  error instanceof DOMException &&
  (error.name === "QuotaExceededError" || error.code === 22 || error.code === 1014)

const referenceGallery = [
  {
    title: "Tomate maduro",
    description: "Fruto completamente maduro con color uniforme y sin defectos visibles.",
    image: "/ripe.jpg",
    quality: "b_fully_ripened",
  },
  {
    title: "Tomate medio",
    description: "Color mixto entre verde y rojo, recomendado para cosecha cercana.",
    image: "/half-ripe.jpg",
    quality: "b_half_ripened",
  },
  {
    title: "Tomate verde",
    description: "Fruto firme con color predominantemente verde, ideal para transporte largo.",
    image: "/unripe.jpg",
    quality: "b_green",
  },
]

const formatDetectionLabel = (value: string) => translateQualityLabel(value)

const formatBatchId = () => {
  const now = new Date()
  return `CAL-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate(),
  ).padStart(2, "0")}-${String(now.getTime()).slice(-4)}`
}

const getConfidenceColor = (score: number) => {
  if (score >= 90) return "text-green-600"
  if (score >= 70) return "text-amber-600"
  return "text-red-600"
}

export default function QualityPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [userId, setUserId] = useState<string | null>(null)
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<QualityRecord | null>(null)
  const [analysisHistory, setAnalysisHistory] = useState<QualityRecord[]>([])
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isCameraLoading, setIsCameraLoading] = useState(false)
  const [isCameraReady, setIsCameraReady] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [batchId, setBatchId] = useState("")
  const [notes, setNotes] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [classFilter, setClassFilter] = useState<string>("all")

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const storedUserId = sessionStorage.getItem("userId")
    setUserId(storedUserId)
  }, [])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(QUALITY_STORAGE_KEY)
      if (stored) {
        setAnalysisHistory(parseStoredHistory(stored))
      }
    } catch (error) {
      console.error("Error al cargar historial de calidad", error)
    }
  }, [])

  useEffect(() => {
    if (!analysisHistory.length) {
      localStorage.removeItem(QUALITY_STORAGE_KEY)
      return
    }

    try {
      localStorage.setItem(QUALITY_STORAGE_KEY, serializeHistory(analysisHistory))
    } catch (error) {
      if (isQuotaExceededError(error)) {
        console.warn("El historial de calidad excede la capacidad de almacenamiento. Se conservara solo durante la sesion.")
        localStorage.removeItem(QUALITY_STORAGE_KEY)
      } else {
        console.error("Error al guardar historial de calidad", error)
      }
    }
  }, [analysisHistory])

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (isCameraActive) {
      stopCamera()
    }

    setUploadedFile(file)
    setErrorMessage(null)
    setCameraError(null)

    const reader = new FileReader()
    reader.onload = (e) => {
      setSelectedPreview(e.target?.result as string)
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
    setSelectedPreview(dataUrl)

    canvas.toBlob((blob) => {
      if (!blob) {
        setCameraError("No se pudo capturar la imagen.")
        return
      }

      const file = new File([blob], `captura-calidad-${Date.now()}.jpg`, { type: "image/jpeg" })
      setUploadedFile(file)
      setErrorMessage(null)
      setCameraError(null)
      stopCamera()
      void analyzeImageFile(file)
    }, "image/jpeg", 0.92)
  }

  const buildRecordFromResponse = (data: any): QualityRecord => {
    const batch = batchId.trim() || formatBatchId()
    const annotatedImage = data.annotated_image
      ? `data:image/jpeg;base64,${data.annotated_image}`
      : null

    return {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      batchId: batch,
      notes: notes.trim(),
      annotatedImage,
      detections: Array.isArray(data.detections) ? data.detections : [],
      total: Number(data.total) || 0,
      classCounts:
        typeof data.class_counts === "object" && data.class_counts !== null ? data.class_counts : {},
    }
  }

  const persistQualityRecord = async (record: QualityRecord, payload: any) => {
    if (typeof window === "undefined") {
      return
    }

    const storedUserId = userId ?? sessionStorage.getItem("userId")
    if (!storedUserId) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/records/quality`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: Number(storedUserId),
          timestamp: record.timestamp,
          batchId: record.batchId,
          notes: record.notes,
          annotatedImage: payload?.annotated_image ?? null,
          detections: record.detections,
          total: record.total,
          classCounts: record.classCounts,
        }),
      })

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}))
        console.warn("No se pudo registrar el análisis de calidad", errorPayload)
      }
    } catch (error) {
      console.error("Error al guardar el análisis de calidad", error)
    }
  }

  const analyzeImageFile = async (file: File) => {
    if (isAnalyzing) {
      return
    }

    setIsAnalyzing(true)
    setErrorMessage(null)

    try {
      const formData = new FormData()
      formData.append("image", file)

      const response = await fetch("/api/quality", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || "Error desconocido en el analisis de calidad")
      }

      const data = await response.json()
      const record = buildRecordFromResponse(data)

      setAnalysisResult(record)
      setAnalysisHistory((prev) => [record, ...prev])
      void persistQualityRecord(record, data)

      if (!batchId.trim()) {
        setBatchId(record.batchId)
      }
    } catch (error) {
      console.error("Error en el analisis de calidad", error)
      setErrorMessage("No fue posible completar el analisis. Verifica que el backend este disponible.")
    } finally {
      setIsAnalyzing(false)
    }
  }


  const handleAnalyze = () => {
    if (!uploadedFile) {
      setErrorMessage("Selecciona una imagen para analizar")
      return
    }

    void analyzeImageFile(uploadedFile)
  }

  const handleClearHistory = () => {
    if (window.confirm("¿Deseas eliminar el historial de análisis de calidad?")) {
      setAnalysisHistory([])
      setAnalysisResult(null)
    }
  }

  const handleDownloadAnnotated = (record: QualityRecord) => {
    if (!record.annotatedImage) return
    const link = document.createElement("a")
    link.href = record.annotatedImage
    link.download = `${record.batchId || "calidad"}.jpg`
    link.click()
  }

  const filteredHistory = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    const filter = classFilter.toLowerCase()

    return analysisHistory.filter((record) => {
      const matchesTerm =
        !term ||
        record.batchId.toLowerCase().includes(term) ||
        record.detections.some((det) => {
          const original = (det.class || "").toLowerCase()
          const translated = translateQualityLabel(det.class).toLowerCase()
          return original.includes(term) || translated.includes(term)
        })
      const matchesFilter =
        filter === "all" ||
        Object.keys(record.classCounts).some(
          (key) => key.toLowerCase() === filter && record.classCounts[key] > 0,
        )
      return matchesTerm && matchesFilter
    })
  }, [analysisHistory, searchTerm, classFilter])

  const statistics = useMemo(() => {
    if (!analysisHistory.length) {
      return {
        total: 0,
        averageDetections: 0,
        classDistribution: {} as Record<string, number>,
        latest: null as QualityRecord | null,
        topClass: null as string | null,
      }
    }

    const classDistribution: Record<string, number> = {}
    let totalDetections = 0

    for (const record of analysisHistory) {
      totalDetections += record.total
      for (const [key, value] of Object.entries(record.classCounts)) {
        classDistribution[key] = (classDistribution[key] ?? 0) + value
      }
    }

    const topClass =
      Object.entries(classDistribution).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

    return {
      total: analysisHistory.length,
      averageDetections: totalDetections / analysisHistory.length,
      classDistribution,
      latest: analysisHistory[0],
      topClass,
    }
  }, [analysisHistory])

  const availableClasses = useMemo(
    () =>
      Array.from(
        new Set(analysisHistory.flatMap((record) => Object.keys(record.classCounts))),
      ).sort(),
    [analysisHistory],
  )

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
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-serif font-bold text-foreground">Módulo de Calidad</h1>
                  <p className="text-sm text-muted-foreground">
                    Evaluación automática del grado de madurez y calidad del tomate
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="analyze" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analyze">Nuevo análisis</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
            <TabsTrigger value="analytics">Estadísticas</TabsTrigger>
            <TabsTrigger value="library">Galería de referencia</TabsTrigger>
          </TabsList>

          {/* Nuevo análisis */}
          <TabsContent value="analyze" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Camera className="h-5 w-5" />
                    <span>Cargar imagen</span>
                  </CardTitle>
                  <CardDescription>
                    Sube una foto del cultivo para detectar el grado de madurez automáticamente.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    {selectedPreview ? (
                      <div className="space-y-4">
                        <Image
                          src={selectedPreview}
                          alt="Imagen seleccionada"
                          width={400}
                          height={280}
                          className="mx-auto h-56 w-auto rounded-lg object-contain"
                          sizes="400px"
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
                            onClick={stopCamera}
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
                    className="hidden"
                    onChange={handleImageUpload}
                  />

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="batch-id">Identificador del lote</Label>
                      <Input
                        id="batch-id"
                        placeholder="CAL-2025-001"
                        value={batchId}
                        onChange={(event) => setBatchId(event.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">Observaciones</Label>
                      <Textarea
                        id="notes"
                        placeholder="Describe condiciones del cultivo, variedad o comentarios adicionales"
                        rows={3}
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                      />
                    </div>
                  </div>

                  <Button className="w-full" onClick={handleAnalyze} disabled={!uploadedFile || isAnalyzing}>
                    {isAnalyzing ? "Analizando imagen..." : "Iniciar análisis"}
                  </Button>

                  {errorMessage && (
                    <p className="text-sm text-destructive text-center">{errorMessage}</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5" />
                    <span>Resultados del análisis</span>
                  </CardTitle>
                  <CardDescription>La imagen procesada y las detecciones del modelo YOLO.</CardDescription>
                </CardHeader>
                <CardContent>
                  {isAnalyzing ? (
                    <p className="text-center text-muted-foreground">Procesando imagen...</p>
                  ) : analysisResult ? (
                    <div className="space-y-4">
                      {analysisResult.annotatedImage ? (
                        <div className="relative overflow-hidden rounded-xl border border-border">
                          <Image
                            src={analysisResult.annotatedImage}
                            alt="Imagen anotada"
                            width={600}
                            height={380}
                            className="h-auto w-full object-contain"
                            sizes="(max-width: 768px) 100vw, 600px"
                          />
                          <Button
                            size="sm"
                            variant="secondary"
                            className="absolute bottom-3 right-3 gap-2"
                            onClick={() => handleDownloadAnnotated(analysisResult)}
                          >
                            <Download className="h-4 w-4" /> Descargar
                          </Button>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          La respuesta no incluyó imagen anotada.
                        </p>
                      )}

                      <div className="rounded-lg border border-border bg-card/70 p-4 text-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="text-xs text-muted-foreground">Lote analizado</p>
                            <p className="font-medium text-foreground">{analysisResult.batchId}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Detecciones</p>
                            <p className="font-semibold text-foreground">{analysisResult.total}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Fecha</p>
                            <p className="font-medium text-foreground">
                              {new Date(analysisResult.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {analysisResult.detections.length ? (
                          analysisResult.detections.map((det, index) => (
                            <div
                              key={`${det.class}-${index}`}
                              className="flex items-center justify-between rounded-lg border border-border px-4 py-2 text-sm"
                            >
                              <div className="flex flex-col">
                                <span className="font-semibold text-foreground">
                                  {formatDetectionLabel(det.class)}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  Coordenadas: {det.bbox.map((value) => value.toFixed(0)).join(", ")}
                                </span>
                              </div>
                              <span className={`font-medium ${getConfidenceColor(det.confidence)}`}>
                                {det.confidence.toFixed(1)}%
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground text-center">
                            No se detectaron objetos en la imagen.
                          </p>
                        )}
                      </div>

                      {analysisResult.notes && (
                        <div className="rounded-lg bg-muted/40 p-4 text-sm text-muted-foreground">
                          <p className="font-medium text-foreground mb-1">Observaciones registradas</p>
                          <p>{analysisResult.notes}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground">
                      Carga una imagen y ejecuta el análisis para ver aquí los resultados.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Historial */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Images className="h-5 w-5" />
                    <span>Historial de evaluaciones</span>
                  </CardTitle>
                  <CardDescription>
                    Consulta los análisis realizados y descarga las imágenes anotadas.
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={handleClearHistory} disabled={!analysisHistory.length}>
                  <Trash2 className="h-4 w-4 mr-2" /> Limpiar historial
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-[2fr,1fr]">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por lote o categoría..."
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      className="h-10 pl-9"
                    />
                  </div>
                  <Select value={classFilter} onValueChange={setClassFilter}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Filtrar por clase" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las categorías</SelectItem>
                      {availableClasses.map((category) => (
                        <SelectItem key={category} value={category}>
                          {formatDetectionLabel(category)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {filteredHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Aún no has registrado análisis o no hay coincidencias con el filtro aplicado.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredHistory.map((record) => (
                      <Card key={record.id} className="overflow-hidden border border-border/80">
                        <div className="grid grid-cols-1 md:grid-cols-[260px,1fr]">
                          <div className="relative h-full bg-muted/40">
                            {record.annotatedImage ? (
                              <Image
                                src={record.annotatedImage}
                                alt={`Resultado ${record.batchId}`}
                                width={360}
                                height={240}
                                className="h-full w-full object-cover"
                                sizes="260px"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                Sin imagen anotada
                              </div>
                            )}
                          </div>
                          <CardContent className="space-y-3 py-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="text-xs text-muted-foreground">Lote</p>
                                <p className="font-semibold text-foreground">{record.batchId}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground">Fecha</p>
                                <p className="font-medium text-foreground">
                                  {new Date(record.timestamp).toLocaleString()}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              {Object.entries(record.classCounts).map(([key, value]) => (
                                <Badge key={key} variant="outline" className="bg-background/60">
                                  {formatDetectionLabel(key)} · {value}
                                </Badge>
                              ))}
                            </div>

                            <div className="grid gap-2 text-sm text-muted-foreground">
                              {record.detections.slice(0, 3).map((det, index) => (
                                <div key={`${record.id}-${det.class}-${index}`} className="flex justify-between">
                                  <span>{formatDetectionLabel(det.class)}</span>
                                  <span className={`font-medium ${getConfidenceColor(det.confidence)}`}>
                                    {det.confidence.toFixed(1)}%
                                  </span>
                                </div>
                              ))}
                              {record.detections.length > 3 && (
                                <span className="text-xs text-muted-foreground">
                                  +{record.detections.length - 3} detecciones adicionales
                                </span>
                              )}
                            </div>

                            {record.notes && (
                              <p className="text-xs text-muted-foreground">
                                <span className="font-medium text-foreground">Notas:</span> {record.notes}
                              </p>
                            )}

                            {record.annotatedImage && (
                              <Button
                                size="sm"
                                variant="secondary"
                                className="mt-2 gap-2"
                                onClick={() => handleDownloadAnnotated(record)}
                              >
                                <Download className="h-4 w-4" /> Descargar imagen
                              </Button>
                            )}
                          </CardContent>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Estadísticas */}
          <TabsContent value="analytics" className="space-y-6">
            {statistics.total === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-sm text-muted-foreground">
                  Realiza al menos un análisis para generar estadísticas.
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Evaluaciones registradas</CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{statistics.total}</div>
                      {statistics.latest && (
                        <p className="text-xs text-muted-foreground">
                          Última: {new Date(statistics.latest.timestamp).toLocaleString()}
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Detecciones promedio</CardTitle>
                      <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{statistics.averageDetections.toFixed(1)}</div>
                      <p className="text-xs text-muted-foreground">Promedio de objetos detectados por imagen</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Categoría frecuente</CardTitle>
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      {statistics.topClass ? (
                        <>
                          <div className="text-lg font-semibold">
                            {formatDetectionLabel(statistics.topClass)}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {statistics.classDistribution[statistics.topClass]} apariciones
                          </p>
                        </>
                      ) : (
                        <div className="text-sm text-muted-foreground">Sin datos registrados</div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Último lote</CardTitle>
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      {statistics.latest ? (
                        <>
                          <div className="text-lg font-semibold">{statistics.latest.batchId}</div>
                          <p className="text-xs text-muted-foreground">
                            {Object.entries(statistics.latest.classCounts)
                              .map(([key, value]) => `${formatDetectionLabel(key)} ${value}`)
                              .join(" · ")}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">Sin registro reciente</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Distribución por categoría</CardTitle>
                      <CardDescription>Proporción de detecciones según clase identificada.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {Object.entries(statistics.classDistribution).map(([key, count]) => (
                        <div key={key} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{formatDetectionLabel(key)}</span>
                            <span className="font-medium text-foreground">{count} detecciones</span>
                          </div>
                          <Progress value={(count / Math.max(statistics.total, 1)) * 100} className="h-2" />
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Último análisis</CardTitle>
                      <CardDescription>Resumen del registro más reciente.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-muted-foreground">
                      {statistics.latest ? (
                        <>
                          <p>
                            <span className="font-medium text-foreground">Lote:</span>{" "}
                            {statistics.latest.batchId}
                          </p>
                          <p>
                            <span className="font-medium text-foreground">Fecha:</span>{" "}
                            {new Date(statistics.latest.timestamp).toLocaleString()}
                          </p>
                          <p>
                            <span className="font-medium text-foreground">Detecciones:</span>{" "}
                            {statistics.latest.total}
                          </p>
                          <p className="flex flex-wrap gap-2">
                            {Object.entries(statistics.latest.classCounts).map(([key, value]) => (
                              <Badge key={key} variant="outline" className="bg-background/60">
                                {formatDetectionLabel(key)} · {value}
                              </Badge>
                            ))}
                          </p>
                        </>
                      ) : (
                        <p>No hay análisis registrados.</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* Galería de referencia */}
          <TabsContent value="library" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Galería de referencia</CardTitle>
                <CardDescription>
                  Ejemplos visuales de clases detectadas por el modelo para apoyar la validación manual.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {referenceGallery.map((item) => (
                    <Card key={item.title} className="overflow-hidden border border-border/70">
                      <div className="relative h-48 w-full bg-muted">
                        <Image src={item.image} alt={item.title} fill sizes="100%" className="object-cover" />
                      </div>
                      <CardContent className="space-y-2 p-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-foreground">{item.title}</h3>
                          <Badge variant="secondary">{formatDetectionLabel(item.quality)}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}







