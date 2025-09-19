import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get("image")

    if (!(image instanceof File)) {
      return NextResponse.json({ error: "No valid image provided" }, { status: 400 })
    }

    // 👉 Usar directamente el FormData nativo
    const backendFormData = new FormData()
    backendFormData.append("image", image) // pasa File directo

    const response = await fetch("http://127.0.0.1:5000/predict/disease", {
      method: "POST",
      body: backendFormData, // 👈 no metas headers, fetch los arma solo
    })

    if (!response.ok) {
      const text = await response.text()
      console.error("❌ Flask respondió error:", text)
      return NextResponse.json(
        { error: "❌ Flask no aceptó la petición", flask_error: text },
        { status: response.status }
      )
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("❌ Error inesperado analizando enfermedad:", error)
    return NextResponse.json({ error: "❌ Error inesperado analizando enfermedad" }, { status: 500 })
  }
}
