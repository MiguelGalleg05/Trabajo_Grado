import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get("image") as File

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    // 🔹 Reempacar imagen
    const backendFormData = new FormData()
    backendFormData.append("image", image)

    // 🔗 Llamar al backend Flask
    const response = await fetch("http://127.0.0.1:5000/predict/quality", {
      method: "POST",
      body: backendFormData,
    })

    if (!response.ok) {
      const text = await response.text()
      console.error("❌ Error del backend Flask:", text)
      return NextResponse.json(
        { error: "Flask respondió con error", flask_error: text },
        { status: response.status }
      )
    }

    // ✅ Respuesta exitosa
    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("❌ Error inesperado en análisis de calidad:", error)
    return NextResponse.json(
      { error: "❌ Error inesperado en análisis de calidad" },
      { status: 500 }
    )
  }
}
