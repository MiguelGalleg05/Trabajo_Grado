# Sistema de Analisis de Tomate

Plataforma full stack para registrar, analizar y monitorear enfermedades y calidad en cultivos de tomate. Combina un frontend en Next.js orientado a la experiencia del usuario y un backend Flask que orquesta los modelos de vision por computador (deteccion de enfermedades y clasificacion de calidad), el almacenamiento en SQLite y la generacion de reportes listos para descargar.

## Tabla de contenido
- [Vision general](#vision-general)
- [Arquitectura](#arquitectura)
- [Funcionalidades destacadas](#funcionalidades-destacadas)
- [Stack tecnologico](#stack-tecnologico)
- [Requisitos previos](#requisitos-previos)
- [Puesta en marcha rapida](#puesta-en-marcha-rapida)
- [Variables de entorno](#variables-de-entorno)
- [Endpoints principales](#endpoints-principales)
- [Base de datos](#base-de-datos)
- [Modelos de ia](#modelos-de-ia)
- [Docker](#docker)
- [Solucion de problemas](#solucion-de-problemas)
- [Roadmap corto](#roadmap-corto)

## Vision general
- Dashboard centralizado con metricas de actividad, alertas automaticas y tendencias temporales.
- Modulos dedicados para analisis de enfermedades y calidad con carga de imagenes, historial y filtros avanzados.
- Exportacion de reportes consolidados (CSV y PDF) directo desde la UI del dashboard.
- Sistema de autenticacion basico (registro e inicio de sesion) respaldado por SQLite.
- Backend preparado para ejecutarse de forma tradicional o empaquetado en contenedor Docker.

## Arquitectura
- **Frontend** (`app/`): Next.js 14 (App Router) con Tailwind, componentes shadcn/ui y graficas Recharts. Consume el API via `fetch` y administra sesion en `sessionStorage`/`localStorage`.
- **Backend** (`python_backend/app.py`): Flask + Flask-CORS. Expone endpoints REST para autenticacion, metricas, historiales y predicciones (`/predict/disease`, `/predict/quality`). Maneja los modelos de ML y la persistencia en SQLite.
- **Modelos** (`python_backend/models/`):
  - `mymodel_v4.keras` para clasificacion de enfermedades.
  - `best.pt` (YOLO) para clasificacion de calidad. 
- **Base de datos** (`python_backend/app.db`): SQLite con tres tablas principales (`users`, `disease_analyses`, `quality_analyses`). Se inicializa automaticamente al arrancar el backend.

## Funcionalidades destacadas
- Autenticacion basica de usuarios (registro/login con hash de contrasena).
- Analisis de enfermedades: carga de imagenes, informacion del muestreo, severidad, tratamiento y prevencion.
- Analisis de calidad: deteccion de clases (fully ripened, half ripened, green), conteos, porcentajes y anotaciones.
- Dashboard con indicadores clave, actividades recientes, alertas dinamicas y comparativos temporales.
- Historial unificado (`/records/history`) con filtros por tipo, severidad, fechas y texto.
- Exportacion CSV/PDF y generacion de reportes en PDF con resumenes y notas.
- Endpoint de salud (`/health`) para verificar disponibilidad del servicio y modelos cargados.

## Stack tecnologico
- **Frontend**: Next.js 14, React 18, Tailwind CSS, Radix UI, Recharts, React Hook Form, Zod.
- **Backend**: Python 3.11, Flask 3, Flask-CORS, SQLite.
- **Modelos**: TensorFlow/Keras, PyTorch, Ultralytics YOLO.
- **Utilidades**: pdf (via reportes), CSV, NumPy, SciPy, Polars para calculos auxiliares.

## Requisitos previos
- Node.js 18+ y npm (o pnpm) instalados.
- Python 3.11 (recomendado el uso de entorno virtual).
- Pip actualizado (`python -m pip install --upgrade pip`).
- Modelos TensorFlow/PyTorch descargados en `python_backend/models/` (ver [Modelos de IA](#modelos-de-ia)).
- Opcional: Docker Desktop si deseas empaquetar el backend en un contenedor.

## Puesta en marcha rapida
1. Clona el repositorio y posicionate en la carpeta raiz `Trabajo_Grado`.
2. ### Backend (Flask)
   ```bash
   cd python_backend
   python -m venv .venv
   .venv\Scripts\activate    
   pip install -r requirements.txt
   python app.py
   ```
   El servidor queda disponible en `http://127.0.0.1:5000`. Al primer arranque se crea/actualiza `app.db`, se cargan los modelos (si existen) y se imprime el estado en consola.
3. ### Frontend (Next.js)
   En otra terminal desde `Trabajo_Grado`:
   ```bash
   npm install
   npm run dev
   ```
   Abre `http://localhost:3000` y accede con un usuario nuevo (usa la vista de registro).

## Variables de entorno
Crea un archivo `.env.local` en la raiz del frontend (`Trabajo_Grado/.env.local`) con la URL del backend:
```
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:5000
```
En despliegues remotos, actualiza el valor con la URL publica del backend.

## Endpoints principales
| Metodo | Ruta | Descripcion |
| ------ | ---- | ----------- |
| GET | `/health` | Estado del servicio y carga de modelos.
| POST/OPTIONS | `/auth/register` | Registrar nuevo usuario (JSON: username, password).
| POST/OPTIONS | `/auth/login` | Iniciar sesion, devuelve `user.id` y `username`.
| GET/OPTIONS | `/metrics/overview` | Resumen completo del dashboard (requiere `user_id`).
| GET | `/records/history` | Historial combinado con filtros (`type`, `severity`, `search`, `start`, `end`, `limit`).
| PATCH | `/records/disease/<id>` | Actualizar notas de un registro de enfermedad.
| PATCH | `/records/quality/<id>` | Actualizar notas de un registro de calidad.
| GET | `/reports/export` | Exportar CSV/PDF (`user_id`, `format`, `start`, `end`).
| POST | `/predict/disease` | Clasificar enfermedad (form-data con `image`).
| POST | `/predict/quality` | Evaluar calidad YOLO (form-data con `image`).

## Base de datos
- Archivo SQLite en `python_backend/app.db` (auto generado).
- Tablas: `users`, `disease_analyses`, `quality_analyses` (relacionadas por `user_id`).
- PRAGMA `foreign_keys` habilitado para preservar integridad en cascada.
- Para reiniciar el estado puedes eliminar `app.db` y reiniciar el backend (se volvera a crear vacio).

## Modelos de IA
- Coloca los archivos de modelo en `python_backend/models/` siguiendo las rutas:
  - `python_backend/models/mymodel_v4.keras`
  - `python_backend/models/best.pt`
- Si necesitas instrucciones de descarga o conversion, revisa `SETUP_MODELS.md`.
- En caso de no existir los archivos, el backend mostrara advertencias pero seguira levantando (los endpoints de prediccion responderan con error 500 indicando que falta el modelo).

## Docker
Al tener Docker Desktop activo, puedes empaquetar solo el backend:
```bash
cd python_backend
docker build -t tomato-backend:latest .
docker run -p 5000:5000 tomato-backend:latest
```
> Nota: la imagen resultante ronda 16 GB debido a TensorFlow + PyTorch. Considera optimizaciones (GPU vs CPU, slim wheels) para despliegues productivos.

## Solucion de problemas
- **No se cargan las metricas en el dashboard**: verifica que `/metrics/overview` responda (`curl http://127.0.0.1:5000/metrics/overview?user_id=1`). Asegurate de haber movido el bloque `if __name__ == '__main__'` al final como ya esta en `python_backend/app.py`.
- **Respuesta 500 en las predicciones**: revisa que los modelos existan en `python_backend/models/` y que Flask tenga permisos de lectura. Observa la consola para ver el mensaje exacto.
- **Dependencias pesadas**: en equipos limitados crea un entorno virtual limpio antes de instalar `requirements.txt`, y revisa el archivo para retirar librerias no necesarias en desarrollos sin ML.
- **Cuenta AWS recien creada**: Lightsail puede tardar hasta 24 h en habilitarse. Sin activacion veras el mensaje `The AWS Access Key Id needs a subscription for the service`.

## Roadmap corto
- Emision de tokens e implementacion de sesiones seguras (JWT o cookies firmadas).
- Persistencia en base de datos externa (PostgreSQL/Aurora) para despliegues multi usuario.
- Automatizacion CI/CD (GitHub Actions) con despliegue a Lightsail/ECS.
- Version mas ligera del contenedor (modelos optimizados, base Debian slim). 
- Soporte para almacenamiento de imagenes en S3 en lugar de solo rutas base64.
