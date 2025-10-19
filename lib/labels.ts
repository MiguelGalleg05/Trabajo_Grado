const normalizeKey = (value: string): string => {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
}

const titleCase = (value: string): string => {
  return value
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

const DISEASE_TRANSLATIONS_RAW: Record<string, string> = {
  "Tomato___Bacterial_spot": "Mancha bacteriana del tomate",
  "Tomato___Early_blight": "Tizon temprano",
  "Tomato___healthy": "Tomate saludable",
  "Tomato___Late_blight": "Tizon tardio",
  "Tomato___Leaf_Mold": "Moho de la hoja",
  "Tomato___Septoria_leaf_spot": "Mancha foliar de Septoria",
  "Tomato___Spider_mites Two-spotted_spider_mite": "Acaro de dos manchas",
  "Tomato___Target_Spot": "Mancha diana",
  "Tomato___Tomato_mosaic_virus": "Virus mosaico del tomate",
  "Tomato___Tomato_Yellow_Leaf_Curl_Virus": "Virus del enrollamiento amarillo del tomate",
}

const QUALITY_TRANSLATIONS_RAW: Record<string, string> = {
  "b_fully_ripened": "Tomate maduro",
  "fully_ripened": "Tomate maduro",
  "ripe": "Tomate maduro",
  "b_half_ripened": "Tomate en maduracion",
  "half_ripened": "Tomate en maduracion",
  "half_ripe": "Tomate en maduracion",
  "b_green": "Tomate verde",
  "green": "Tomate verde",
  "unripe": "Tomate verde",
  "b_overripe": "Tomate sobremaduro",
  "overripe": "Tomate sobremaduro",
  "damaged": "Tomate danado",
  "defect": "Tomate defectuoso",
  "premium": "Tomate premium",
}

const buildTranslationMap = (source: Record<string, string>): Map<string, string> => {
  const map = new Map<string, string>()

  for (const [rawKey, label] of Object.entries(source)) {
    const normalizedKey = normalizeKey(rawKey)
    map.set(normalizedKey, label)

    const noPrefixKey = normalizeKey(rawKey.replace(/^tomato[_]+/i, ""))
    map.set(noPrefixKey, label)

    map.set(normalizeKey(label), label)
  }

  return map
}

const DISEASE_TRANSLATIONS = buildTranslationMap(DISEASE_TRANSLATIONS_RAW)
const QUALITY_TRANSLATIONS = buildTranslationMap(QUALITY_TRANSLATIONS_RAW)

export const translateDiseaseLabel = (value: string | null | undefined): string => {
  if (!value) {
    return "Desconocida"
  }

  const normalized = normalizeKey(value)
  if (!normalized) {
    return "Desconocida"
  }

  const translated = DISEASE_TRANSLATIONS.get(normalized)
  if (translated) {
    return translated
  }

  const cleaned = value.replace(/[_]+/g, " ").replace(/\s{2,}/g, " ").trim()
  return cleaned ? titleCase(cleaned) : "Desconocida"
}

export const translateQualityLabel = (value: string | null | undefined): string => {
  if (!value) {
    return "Sin categoria"
  }

  const normalized = normalizeKey(value)
  if (!normalized) {
    return "Sin categoria"
  }

  const translated = QUALITY_TRANSLATIONS.get(normalized)
  if (translated) {
    return translated
  }

  const cleaned = value
    .replace(/^b[_-]/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim()

  return cleaned ? titleCase(cleaned) : "Sin categoria"
}

export const translateQualityRecordDetail = (
  counts: Record<string, number> | null | undefined,
): Record<string, number> => {
  if (!counts) {
    return {}
  }

  const result: Record<string, number> = {}
  for (const [key, value] of Object.entries(counts)) {
    const label = translateQualityLabel(key)
    result[label] = (result[label] ?? 0) + Number(value ?? 0)
  }
  return result
}
