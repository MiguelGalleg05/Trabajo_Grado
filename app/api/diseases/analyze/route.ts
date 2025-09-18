import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get("image")

    if (!(image instanceof File)) {
      return NextResponse.json({ error: "No valid image provided" }, { status: 400 })
    }

    const backendFormData = new FormData()
    backendFormData.append("image", image)

    try {
      // 🔗 Llamar al backend Flask
      const response = await fetch("http://localhost:5000/predict/disease", {
        method: "POST",
        body: backendFormData,
      })

      if (!response.ok) {
        return NextResponse.json(
          { error: "❌ No se pudo establecer conexión con el backend Flask" },
          { status: 502 }
        )
      }

      const result = await response.json()
      return NextResponse.json(result)
    } catch (backendError) {
      console.error("❌ Error conectando al backend Flask:", backendError)
      return NextResponse.json(
        { error: "❌ No se pudo establecer conexión con el backend Flask" },
        { status: 502 }
      )
    }
  } catch (error) {
    console.error("❌ Error inesperado analizando enfermedad:", error)
    return NextResponse.json({ error: "❌ Error inesperado analizando enfermedad" }, { status: 500 })
  }
}
