"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Clock, Filter, RefreshCw, Save } from "lucide-react"
import { translateDiseaseLabel, translateQualityLabel } from "@/lib/labels"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api"

type HistoryRecord = {
  recordType: "disease" | "quality"
  id: number
  timestamp: string | null
  severity: string | null
  title: string | null
  identifier: string | null
  notes: string | null
  meta: {
    confidence?: number | null
    location?: string | null
    totalDetections?: number | null
    classCounts?: Record<string, number> | null
  }
}

const formatTimestamp = (value: string | null | undefined) => {
  if (!value) return "Sin fecha"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" })
}

const formatDetectionLabel = (value: string | null | undefined) => {
  if (!value) return "Sin categoria"
  return translateQualityLabel(value)
}

const formatSeverityLabel = (severity: string | null | undefined) => {
  const normalized = (severity || "").toLowerCase()
  if (normalized.includes("alto")) return "Alto riesgo"
  if (normalized.includes("medio")) return "Medio riesgo"
  if (normalized.includes("bajo")) return "Bajo riesgo"
  return severity || "Sin clasificacion"
}

const getSeverityBadgeVariant = (severity: string | null | undefined) => {
  const normalized = (severity || "").toLowerCase()
  if (normalized.includes("alto")) return "destructive" as const
  if (normalized.includes("medio")) return "secondary" as const
  if (normalized.includes("bajo")) return "outline" as const
  return "outline" as const
}

export default function HistoryPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [records, setRecords] = useState<HistoryRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    type: "all",
    severity: "all",
    search: "",
    start: "",
    end: "",
    limit: "50",
  })
  const [editedNotes, setEditedNotes] = useState<Record<string, string>>({})

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }
    const storedUserId = sessionStorage.getItem("userId")
    if (!storedUserId) {
      router.push("/")
      return
    }
    setUserId(storedUserId)
  }, [router])

  const historyLabel = useMemo(() => {
    const parts = [] as string[]
    if (filters.start) parts.push(`desde ${filters.start}`)
    if (filters.end) parts.push(`hasta ${filters.end}`)
    return parts.length ? parts.join(" " ) : "Ultimos registros"
  }, [filters.start, filters.end])

  const fetchHistory = async () => {
    if (!userId) {
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ user_id: userId })
      if (filters.type && filters.type !== "all") params.set("type", filters.type)
      if (filters.severity && filters.severity !== "all") params.set("severity", filters.severity)
      if (filters.search) params.set("search", filters.search)
      if (filters.start) params.set("start", filters.start)
      if (filters.end) params.set("end", filters.end)
      if (filters.limit) params.set("limit", filters.limit)

      const response = await fetch(`${API_BASE_URL}/records/history?${params.toString()}`)
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error((payload as { error?: string }).error || "No fue posible cargar el historial")
      }
      const { records: incoming } = payload as { records: HistoryRecord[] }
      const adapted = (incoming ?? []).map((record) => {
        if (record.recordType === "disease") {
          return {
            ...record,
            title: translateDiseaseLabel(record.title),
          }
        }

        if (record.recordType === "quality") {
          return {
            ...record,
            title: translateQualityLabel(record.title),
            meta: {
              ...record.meta,
              classCounts: record.meta.classCounts || {},
            },
          }
        }

        return record
      })
      setRecords(adapted)
      setEditedNotes({})
    } catch (requestError) {
      console.error(requestError)
      setError("Error al cargar el historial consolidado.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      void fetchHistory()
    }
  }, [userId])

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleApplyFilters = () => {
    void fetchHistory()
  }

  const handleResetFilters = () => {
    setFilters({ type: "all", severity: "all", search: "", start: "", end: "", limit: "50" })
    setTimeout(() => {
      void fetchHistory()
    }, 0)
  }

  const handleNoteChange = (key: string, value: string) => {
    setEditedNotes((prev) => ({ ...prev, [key]: value }))
  }

  const handleSaveNotes = async (record: HistoryRecord) => {
    if (!userId) return

    const key = `${record.recordType}-${record.id}`
    const note = editedNotes[key] ?? record.notes ?? ""

    setSavingId(key)
    try {
      const endpoint = record.recordType === "disease" ? "disease" : "quality"
      const response = await fetch(`${API_BASE_URL}/records/${endpoint}/${record.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, notes: note }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error((payload as { error?: string }).error || "No se pudo actualizar la nota")
      }
      const updated = (payload as { record: HistoryRecord }).record
      setRecords((prev) =>
        prev.map((item) =>
          item.recordType === record.recordType && item.id === record.id ? { ...item, notes: updated.notes } : item
        )
      )
      setEditedNotes((prev) => ({ ...prev, [key]: updated.notes ?? "" }))
    } catch (saveError) {
      console.error(saveError)
      setError("No se pudieron guardar las notas.")
    } finally {
      setSavingId(null)
    }
  }

  const renderRecordMeta = (record: HistoryRecord) => {
    if (record.recordType === "disease") {
      return (
        <div className="text-xs text-muted-foreground space-y-1">
          {record.meta.confidence !== undefined && record.meta.confidence !== null && (
            <p>Confianza: {record.meta.confidence.toFixed(1)}%</p>
          )}
          {record.meta.location && <p>Ubicacion: {record.meta.location}</p>}
        </div>
      )
    }

    const classCounts = record.meta.classCounts || {}
    return (
      <div className="text-xs text-muted-foreground space-y-1">
        <p>Detecciones totales: {record.meta.totalDetections ?? 0}</p>
        {Object.keys(classCounts).length > 0 && (
          <p>
            {Object.entries(classCounts)
              .map(([label, value]) => `${formatDetectionLabel(label)}: ${value}`)
              .join(" | ")}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-xl font-serif font-bold text-foreground">Historial consolidado</h1>
              <p className="text-sm text-muted-foreground">{historyLabel}</p>
            </div>
            <Button variant="outline" onClick={() => router.push("/dashboard")}>Volver al panel</Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" /> Filtros
            </CardTitle>
            <CardDescription>Refina la busqueda por tipo de registro, severidad o rango de fechas.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-6">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <select
                id="type"
                name="type"
                value={filters.type}
                onChange={handleSelectChange}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="all">Todos</option>
                <option value="disease">Enfermedades</option>
                <option value="quality">Calidad</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Severidad</Label>
              <select
                id="severity"
                name="severity"
                value={filters.severity}
                onChange={handleSelectChange}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="all">Todas</option>
                <option value="alto">Alto riesgo</option>
                <option value="medio">Medio riesgo</option>
                <option value="bajo">Bajo riesgo</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start">Desde</Label>
              <Input id="start" name="start" type="date" value={filters.start} onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end">Hasta</Label>
              <Input id="end" name="end" type="date" value={filters.end} onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="limit">Limite</Label>
              <Input id="limit" name="limit" type="number" min={1} value={filters.limit} onChange={handleInputChange} />
            </div>

            <div className="space-y-2 md:col-span-2 lg:col-span-1">
              <Label htmlFor="search">Buscar</Label>
              <Input
                id="search"
                name="search"
                placeholder="Muestra, lote o nota"
                value={filters.search}
                onChange={handleInputChange}
              />
            </div>

            <div className="flex items-end gap-3 md:col-span-2">
              <Button onClick={handleApplyFilters} className="flex-1">
                <Clock className="h-4 w-4 mr-2" /> Aplicar filtros
              </Button>
              <Button variant="outline" onClick={handleResetFilters} className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" /> Limpiar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Registros encontrados</CardTitle>
              <CardDescription>
                {isLoading ? "Actualizando informacion..." : `${records.length} registros`} 
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Cargando historial...</p>
            ) : records.length === 0 ? (
              <p className="text-sm text-muted-foreground">No se encontraron registros con los filtros seleccionados.</p>
            ) : (
              records.map((record) => {
                const key = `${record.recordType}-${record.id}`
                const currentNote = editedNotes[key] ?? record.notes ?? ""
                return (
                  <Card key={key} className="border border-border/70">
                    <CardContent className="py-4 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <Badge variant="secondary" className="uppercase tracking-wide">
                            {record.recordType === "disease" ? "Enfermedad" : "Calidad"}
                          </Badge>
                          <p className="mt-1 text-sm font-semibold text-foreground">{record.title ?? "Sin etiqueta"}</p>
                          <p className="text-xs text-muted-foreground">
                            {record.identifier ? `Identificador: ${record.identifier}` : "Sin identificador"}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-xs text-muted-foreground">{formatTimestamp(record.timestamp)}</p>
                          {record.recordType === "disease" && (
                            <Badge variant={getSeverityBadgeVariant(record.severity)}>
                              {formatSeverityLabel(record.severity)}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {renderRecordMeta(record)}

                      <div className="space-y-2">
                        <Label htmlFor={`notes-${key}`} className="text-xs">Notas</Label>
                        <Textarea
                          id={`notes-${key}`}
                          value={currentNote}
                          onChange={(event) => handleNoteChange(key, event.target.value)}
                          rows={3}
                        />
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleNoteChange(key, record.notes ?? "")}
                          >
                            Deshacer
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSaveNotes(record)}
                            disabled={savingId === key}
                          >
                            <Save className="h-4 w-4 mr-2" />
                            {savingId === key ? "Guardando..." : "Guardar"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
      </main>
    </div>
  )
}
