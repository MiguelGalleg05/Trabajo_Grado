# 🤖 Integración de Modelos Keras

## 📁 Estructura de Carpetas

Crea esta estructura en tu proyecto:

\`\`\`
Trabajo_Grado/
├── models/                    # 👈 CREA ESTA CARPETA
│   ├── disease_model.keras   # 👈 TU MODELO DE ENFERMEDADES
│   └── quality_model.keras   # 👈 TU MODELO DE CALIDAD
├── python_backend/           # ✅ YA CREADO
│   ├── app.py
│   ├── disease_predictor.py
│   ├── quality_predictor.py
│   └── requirements.txt
└── start_backend.bat         # ✅ YA CREADO
\`\`\`

## 🚀 Pasos para Usar Tus Modelos

### 1. Coloca tus modelos
\`\`\`bash
# Copia tus archivos .keras a la carpeta models/
models/
├── disease_model.keras  # Tu modelo de enfermedades
└── quality_model.keras  # Tu modelo de calidad
\`\`\`

### 2. Inicia el backend Python
\`\`\`bash
# Opción 1: Doble click en start_backend.bat
# Opción 2: Desde terminal
cd python_backend
pip install -r requirements.txt
python app.py
\`\`\`

### 3. Inicia el frontend Next.js
\`\`\`bash
# En otra terminal
npm run dev
\`\`\`

## 🔧 Configuración de Modelos

### Si tus modelos usan diferentes tamaños de imagen:
Edita `disease_predictor.py` y `quality_predictor.py`:

\`\`\`python
# Línea 65 y 67 en ambos archivos
image = image.resize((224, 224))  # 👈 CAMBIA ESTE TAMAÑO
\`\`\`

### Si tus clases son diferentes:
Edita las listas de clases en los archivos:

\`\`\`python
# En disease_predictor.py - línea 8
self.disease_classes = [
    'Tu_Clase_1',
    'Tu_Clase_2',
    # ... tus clases
]

# En quality_predictor.py - línea 8  
self.quality_classes = [
    'Tu_Clase_1',
    'Tu_Clase_2', 
    # ... tus clases
]
\`\`\`

## ✅ Verificación

1. **Backend funcionando**: http://localhost:5000/health
2. **Frontend funcionando**: http://localhost:3000
3. **Sube una imagen** y verifica que use tu modelo real

## 🔄 Modo Simulación vs Real

- **Sin modelos**: Usa simulación inteligente con tus clases reales
- **Con modelos**: Usa tus modelos Keras entrenados automáticamente

¡Tu sistema está listo para la presentación de tesis! 🎓
