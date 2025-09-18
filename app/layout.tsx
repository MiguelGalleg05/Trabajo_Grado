import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Source_Sans_3 as Source_Sans_Pro, Playfair_Display } from "next/font/google";
import "./globals.css";

// Otras fuentes de Google
const sourceSansPro = Source_Sans_Pro({
  variable: "--font-source-sans-pro",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Sistema de Análisis de Tomate - Trabajo de Grado",
  description: "Plataforma profesional para análisis de enfermedades y calidad en hojas de tomate"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${GeistSans.variable} ${GeistMono.variable} ${sourceSansPro.variable} ${playfairDisplay.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
