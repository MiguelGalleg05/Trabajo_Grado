"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { TooltipProps } from "recharts"
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent"

import {
  Activity,
  AlertCircle,
  Calendar,
  Download,
  History,
  LogOut,
  Microscope,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react"
import { translateDiseaseLabel, translateQualityLabel } from "@/lib/labels"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api"

type SummaryMetrics = {
  analysis: { total: number; deltaLabel: string }
  disease: { total: number; unique: number; recentCount: number; recentLabel: string }
  quality: { score: number; total: number; label: string }
  confidence: { percentage: number; label: string }
}

type DiseaseRecentItem = {
  id: number
  sampleId: string | null
  disease: string | null
  severity: string | null
  timestamp: string | null
}

type QualityRecentItem = {
  id: number
  batchId: string | null
  label: string | null
  percentage: number
  timestamp: string | null
}

type ActivityItem = {
  id: string
  type: "disease" | "quality"
  title: string
  detail: string
  timestamp: string | null
  status: string
}

type AlertItem = {
  type: "disease" | "quality" | "model"
  title: string
  message: string
}

type TimeseriesPoint = {
  date: string
  total: number
  highSeverity?: number
  premium?: number
  green?: number
}

type DashboardMetrics = {
  summary: SummaryMetrics
  disease: { recent: DiseaseRecentItem[]; severityBreakdown: Record<string, number> }
  quality: { recent: QualityRecentItem[]; classDistribution: Record<string, number> }
  activity: ActivityItem[]
  alerts: AlertItem[]
  timeseries: { disease: TimeseriesPoint[]; quality: TimeseriesPoint[] }
}


const DISEASE_BAR_COLOR = "#dc2626"
const QUALITY_BAR_COLOR = "#2563eb"

type TimeseriesComparisonDatum = {
  date: string
  disease: number
  quality: number
  diseaseHighSeverity: number
  premium: number
  green: number
}


const withSpanishLabels = (metrics: DashboardMetrics): DashboardMetrics => {
  const diseaseRecent = metrics.disease.recent.map((item) => ({
    ...item,
    disease: translateDiseaseLabel(item.disease),
  }))

  const qualityRecent = metrics.quality.recent.map((item) => ({
    ...item,
    label: translateQualityLabel(item.label),
  }))

  const qualityDistribution = Object.entries(metrics.quality.classDistribution).reduce<Record<string, number>>((acc, [key, value]) => {
    const label = translateQualityLabel(key)
    acc[label] = (acc[label] ?? 0) + value
    return acc
  }, {})

  const activity = metrics.activity.map((item) => {
    if (item.type === "disease") {
      return {
        ...item,
        title: translateDiseaseLabel(item.title),
      }
    }

    if (item.type === "quality") {
      return {
        ...item,
        detail: translateQualityLabel(item.detail),
      }
    }

    return item
  })

  return {
    ...metrics,
    disease: {
      ...metrics.disease,
      recent: diseaseRecent,
    },
    quality: {
      ...metrics.quality,
      recent: qualityRecent,
      classDistribution: qualityDistribution,
    },
    activity,
  }
}

const formatDateLabel = (value: string | number | undefined) => {
  if (!value) {
    return ""
  }
  const date = new Date(typeof value === "string" ? value : String(value))
  if (Number.isNaN(date.getTime())) {
    return String(value)
  }
  return date.toLocaleDateString("es-ES", { dateStyle: "medium" })
}

const TimeseriesTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<ValueType, NameType>) => {
  if (!active || !payload?.length) {
    return null
  }
  const datum = payload[0].payload as TimeseriesComparisonDatum
  return (
    <div className="rounded-md border bg-background/95 p-2 text-xs shadow-sm">
      <p className="font-medium text-foreground">{formatDateLabel(label)}</p>
      <p className="mt-2 inline-flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: DISEASE_BAR_COLOR }} />
        Enfermedades: <span className="font-semibold">{datum.disease}</span>
      </p>
      {datum.diseaseHighSeverity ? (
        <p className="text-xs text-destructive">Alta severidad: {datum.diseaseHighSeverity}</p>
      ) : null}
      <p className="inline-flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: QUALITY_BAR_COLOR }} />
        Calidad: <span className="font-semibold">{datum.quality}</span>
      </p>
      {datum.green ? (
        <p className="text-xs text-muted-foreground">Tomates verdes: {datum.green}</p>
      ) : null}
    </div>
  )
}

const TimeseriesComparisonChart = ({
  disease,
  quality,
}: { disease: TimeseriesPoint[]; quality: TimeseriesPoint[] }) => {
  const dataset = useMemo(() => {
    const map = new Map<string, TimeseriesComparisonDatum>()

    for (const point of disease) {
      const entry =
        map.get(point.date) ?? {
          date: point.date,
          disease: 0,
          quality: 0,
          diseaseHighSeverity: 0,
          premium: 0,
          green: 0,
        }
      entry.disease += point.total
      entry.diseaseHighSeverity += point.highSeverity ?? 0
      map.set(point.date, entry)
    }

    for (const point of quality) {
      const entry =
        map.get(point.date) ?? {
          date: point.date,
          disease: 0,
          quality: 0,
          diseaseHighSeverity: 0,
          premium: 0,
          green: 0,
        }
      entry.quality += point.total
      entry.premium += point.premium ?? 0
      entry.green += point.green ?? 0
      map.set(point.date, entry)
    }

    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date))
  }, [disease, quality])

  if (!dataset.length) {
    return <p className="text-xs text-muted-foreground">Sin datos registrados.</p>
  }

  const single = dataset.length === 1 ? dataset[0] : null

  return (
    <div className="space-y-3">
      <ResponsiveContainer width="100%" height={dataset.length === 1 ? 180 : 220}>
        <BarChart data={dataset} margin={{ top: 8, right: 12, left: 4, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <RechartsTooltip content={<TimeseriesTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.12 }} />
          <Legend
            payload={[
              { value: "Enfermedades", type: "square", color: DISEASE_BAR_COLOR },
              { value: "Calidad", type: "square", color: QUALITY_BAR_COLOR },
            ]}
          />
          <Bar dataKey="disease" fill={DISEASE_BAR_COLOR} radius={[4, 4, 0, 0]} />
          <Bar dataKey="quality" fill={QUALITY_BAR_COLOR} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      {single ? (
        <p className="text-xs text-muted-foreground">
          El {formatDateLabel(single.date)} se registraron {single.disease} análisis de enfermedades y {single.quality} evaluaciones de calidad.
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Compara el volumen diario de análisis de enfermedades y evaluaciones de calidad en el periodo reciente.
        </p>
      )}
    </div>
  )
}

const formatNumber = (value: number) => value.toLocaleString("es-ES")

const formatTimestamp = (value: string | null | undefined) => {
  if (!value) {
    return "Sin fecha"
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" })
}

const formatDetectionLabel = (value: string | null | undefined) => {
  if (!value) {
    return "Sin categoria"
  }

  return translateQualityLabel(value)
}

const getSeverityColor = (severity: string | null | undefined) => {
  const normalized = (severity || "").toLowerCase()
  if (normalized.includes("alto")) return "text-destructive"
  if (normalized.includes("medio")) return "text-amber-500"
  if (normalized.includes("bajo")) return "text-green-600"
  return "text-muted-foreground"
}

const formatSeverityLabel = (severity: string | null | undefined) => {
  const normalized = (severity || "").toLowerCase()
  if (normalized.includes("alto")) return "Alto riesgo"
  if (normalized.includes("medio")) return "Medio riesgo"
  if (normalized.includes("bajo")) return "Bajo riesgo"
  return severity || "Sin clasificacion"
}

const getQualityColor = (percentage: number) => {
  if (percentage >= 50) return "text-green-600"
  if (percentage >= 30) return "text-amber-500"
  return "text-destructive"
}

export default function DashboardPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [userId, setUserId] = useState<string | null>(null)
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState<{ csv: boolean; pdf: boolean }>({ csv: false, pdf: false })

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const storedUserId = sessionStorage.getItem("userId")
    const storedUsername = sessionStorage.getItem("username")

    if (!storedUserId) {
      router.push("/")
      return
    }

    setUserId(storedUserId)
    setUsername(storedUsername ?? "usuario")
  }, [router])

  const loadMetrics = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/metrics/overview?user_id=${id}`)
      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        const message = (payload as { error?: string }).error || "No se pudieron cargar las metricas"
        throw new Error(message)
      }

      setMetrics(withSpanishLabels(payload as DashboardMetrics))
    } catch (fetchError) {
      console.error("Error cargando metricas del dashboard", fetchError)
      setError("No fue posible cargar las metricas en este momento.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!userId) {
      return
    }

    void loadMetrics(userId)
  }, [userId, loadMetrics])

  const handleLogout = () => {
    sessionStorage.removeItem("userId")
    sessionStorage.removeItem("username")
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("username")
    router.push("/")
  }

  const navigateToModule = (module: string) => {
    router.push(`/dashboard/${module}`)
  }

  const handleDownload = async (format: "csv" | "pdf") => {
    if (!userId) {
      return
    }

    setIsDownloading((prev) => ({ ...prev, [format]: true }))
    try {
      const response = await fetch(`${API_BASE_URL}/reports/export?user_id=${userId}&format=${format}`)
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error((payload as { error?: string }).error || "No se pudo generar el reporte")
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = format === "csv" ? "reporte_metricas.csv" : "reporte_metricas.pdf"
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (downloadError) {
      console.error(downloadError)
      setError("No se pudo descargar el reporte solicitado.")
    } finally {
      setIsDownloading((prev) => ({ ...prev, [format]: false }))
    }
  }

  const summary = metrics?.summary
  const alerts = metrics?.alerts ?? []
  const diseaseRecent = metrics?.disease.recent ?? []
  const qualityDistribution = useMemo(() => {
    if (!metrics) return [] as Array<[string, number]>
    return Object.entries(metrics.quality.classDistribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
  }, [metrics])
  const activityItems = metrics?.activity ?? []
  const diseaseTimeseries = metrics?.timeseries.disease ?? []
  const qualityTimeseries = metrics?.timeseries.quality ?? []

  const summaryCards = [
    {
      title: "Analisis realizados",
      icon: Activity,
      value: summary ? formatNumber(summary.analysis.total) : isLoading ? "..." : "0",
      helper: summary?.analysis.deltaLabel ?? (isLoading ? "Cargando..." : "Sin registros"),
    },
    {
      title: "Enfermedades detectadas",
      icon: Microscope,
      value: summary ? formatNumber(summary.disease.unique) : isLoading ? "..." : "0",
      helper: summary?.disease.recentLabel ?? (isLoading ? "Cargando..." : "Sin registros"),
    },
    {
      title: "Calidad promedio",
      icon: Star,
      value: summary ? `${summary.quality.score.toFixed(1)}/10` : isLoading ? "..." : "0/10",
      helper: summary?.quality.label ?? (isLoading ? "Cargando..." : "Sin datos"),
    },
    {
      title: "Precision del sistema",
      icon: TrendingUp,
      value: summary ? `${summary.confidence.percentage.toFixed(1)}%` : isLoading ? "..." : "0%",
      helper: summary?.confidence.label ?? (isLoading ? "Cargando..." : "Sin datos"),
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-primary rounded-lg p-2">
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-serif font-bold text-foreground">Sistema de Analisis</h1>
                <p className="text-sm text-muted-foreground">Panel principal</p>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-2">Panel de control</h2>
          <p className="text-muted-foreground text-balance">Gestiona y analiza datos de enfermedades y calidad en hojas de tomate.</p>
        </div>

        {error && (
          <div className="mb-8">
            <p className="text-sm text-destructive border border-destructive/20 bg-destructive/10 rounded-md px-4 py-3">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {summaryCards.map((card) => {
            const Icon = card.icon
            return (
              <Card key={card.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="text-xs text-muted-foreground">{card.helper}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          <Button variant="secondary" onClick={() => router.push("/dashboard/history")}>
            <History className="h-4 w-4 mr-2" /> Ver historial consolidado
          </Button>
          <Button
            variant="outline"
            onClick={() => handleDownload("csv")}
            disabled={isDownloading.csv}
          >
            <Download className="h-4 w-4 mr-2" />
            {isDownloading.csv ? "Generando CSV..." : "Descargar CSV"}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleDownload("pdf")}
            disabled={isDownloading.pdf}
          >
            <Download className="h-4 w-4 mr-2" />
            {isDownloading.pdf ? "Generando PDF..." : "Descargar PDF"}
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" /> Comparativo temporal
              </CardTitle>
              <CardDescription>Distribución de análisis y evaluaciones por fecha reciente.</CardDescription>
            </CardHeader>
            <CardContent>
              <TimeseriesComparisonChart disease={diseaseTimeseries} quality={qualityTimeseries} />
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" /> Alertas recientes
              </CardTitle>
              <CardDescription>Condiciones que requieren atencion prioritaria.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin alertas registradas.</p>
              ) : (
                alerts.map((alert, index) => (
                  <div key={`${alert.title}-${index}`} className="rounded-md border border-border p-3 bg-muted/40">
                    <p className="text-sm font-medium text-foreground">{alert.title}</p>
                    <p className="text-xs text-muted-foreground">{alert.message}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 mt-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateToModule("diseases")}>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 rounded-lg p-3">
                  <Microscope className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl font-serif">Modulo de Enfermedades</CardTitle>
                  <CardDescription>Deteccion y analisis de enfermedades en hojas de tomate.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Ultimos analisis</span>
                  <Badge variant="secondary">
                    {summary ? `${summary.disease.recentCount} nuevos` : isLoading ? "..." : "0 nuevos"}
                  </Badge>
                </div>
                {diseaseRecent.length > 0 ? (
                  <div className="space-y-2">
                    {diseaseRecent.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between text-sm">
                        <span>{entry.disease ?? "Sin etiqueta"}</span>
                        <span className={getSeverityColor(entry.severity)}>{formatSeverityLabel(entry.severity)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">{isLoading ? "Cargando datos..." : "Aun no hay analisis registrados."}</p>
                )}
                <Button className="w-full mt-4" onClick={() => navigateToModule("diseases")}>Ir al modulo</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateToModule("quality")}>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="bg-accent/10 rounded-lg p-3">
                  <Star className="h-8 w-8 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-xl font-serif">Modulo de Calidad</CardTitle>
                  <CardDescription>Clasificacion y evaluacion de calidad del tomate.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Evaluaciones recientes</span>
                  <Badge variant="secondary">
                    {metrics ? `${metrics.quality.recent.length} nuevas` : isLoading ? "..." : "0 nuevas"}
                  </Badge>
                </div>
                {qualityDistribution.length > 0 ? (
                  <div className="space-y-2">
                    {qualityDistribution.map(([label, percentage]) => (
                      <div key={label} className="flex items-center justify-between text-sm">
                        <span>{formatDetectionLabel(label)}</span>
                        <span className={getQualityColor(percentage)}>{percentage.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">{isLoading ? "Cargando datos..." : "Aun no hay evaluaciones registradas."}</p>
                )}
                <Button className="w-full mt-4" onClick={() => navigateToModule("quality")}>Ir al modulo</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Actividad reciente</span>
            </CardTitle>
            <CardDescription>Ultimas acciones registradas en el sistema.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activityItems.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center">
                  {error ? error : isLoading ? "Cargando actividad..." : "Aun no hay actividad registrada."}
                </p>
              ) : (
                activityItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50">
                    {item.type === "disease" ? (
                      <span className="bg-primary/10 rounded-full p-2">
                        <Microscope className="h-4 w-4 text-primary" />
                      </span>
                    ) : (
                      <span className="bg-accent/10 rounded-full p-2">
                        <Star className="h-4 w-4 text-accent" />
                      </span>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.detail ? `${item.detail} - ` : ""}
                        {formatTimestamp(item.timestamp)}
                      </p>
                    </div>
                    <Badge variant="outline">{item.status}</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

