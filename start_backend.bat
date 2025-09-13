@echo off
echo 🚀 Iniciando servidor Python para modelos de IA...
echo.

cd python_backend

echo 📦 Instalando dependencias...
pip install -r requirements.txt

echo.
echo 🔥 Iniciando servidor Flask...
echo ✅ Servidor disponible en: http://localhost:5000
echo 🔍 Health check: http://localhost:5000/health
echo.

python app.py

pause
