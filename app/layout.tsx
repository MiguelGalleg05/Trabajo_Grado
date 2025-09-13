import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Source_Sans_3 as Source_Sans_Pro, Playfair_Display } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const sourceSansPro = Source_Sans_Pro({
  variable: "--font-source-sans-pro",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
})

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: ["400", "700"],
})

export const metadata: Metadata = {
  title: "Sistema de Análisis de Tomate - Trabajo de Grado",
  description: "Plataforma profesional para análisis de enfermedades y calidad en hojas de tomate",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${sourceSansPro.variable} ${playfairDisplay.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  )
}
