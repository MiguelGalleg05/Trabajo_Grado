import { GraduationCap, University, BookOpen } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Thesis Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <h3 className="font-serif font-semibold text-foreground">Trabajo de Grado</h3>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Sistema de Análisis de Enfermedades y Calidad en Tomates</p>
              <p>Aplicación de técnicas de visión por computadora e inteligencia artificial</p>
              <p>Carrera: Ingeniería de Sistemas</p>
            </div>
          </div>

          {/* University Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <University className="h-5 w-5 text-primary" />
              <h3 className="font-serif font-semibold text-foreground">Universidad</h3>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Universidad Católica Luis Amigó</p>
              <p>Facultad de Arquitectura e Ingenierías</p>
              <p>Departamento de Informática</p>
              <p>Año: 2025</p>
            </div>
          </div>

          {/* Academic Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h3 className="font-serif font-semibold text-foreground">Información Académica</h3>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">Autores:</span> Miguel Gallego Alvarez y Juan Garcia Puerta
              </p>
              <p>
                <span className="font-medium text-foreground">Tutor:</span> Juan Camilo Briñez
              </p>
              <p className="text-xs">Desarrollado como requisito para optar al título de Ingeniero en Sistemas</p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-sm text-muted-foreground">
              <p>© 2025 - Trabajo de Grado en Ingeniería de Sistemas</p>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Sistema desarrollado con fines académicos y de investigación</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
