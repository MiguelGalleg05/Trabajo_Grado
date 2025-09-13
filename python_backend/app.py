from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
from disease_predictor import DiseasePredictor
from quality_predictor import QualityPredictor

app = Flask(__name__)
CORS(app)

# Initialize predictors
disease_predictor = None
quality_predictor = None

def initialize_predictors():
    global disease_predictor, quality_predictor
    try:
        # Initialize disease predictor
        disease_model_path = os.path.join('..', 'models', 'disease_model.keras')
        if os.path.exists(disease_model_path):
            disease_predictor = DiseasePredictor(disease_model_path)
            print("✅ Disease model loaded successfully")
        else:
            print("⚠️ Disease model not found, using simulation")
            
         # Initialize quality predictor
        quality_model_keras = os.path.join('..', 'models', 'quality_model.keras')
        quality_model_pt = os.path.join('..', 'models', 'quality_model.pt')

        if os.path.exists(quality_model_keras):
            quality_predictor = QualityPredictor(quality_model_keras)
            print("✅ Quality model loaded successfully (Keras)")
        elif os.path.exists(quality_model_pt):
            quality_predictor = QualityPredictor(quality_model_pt)
            print("✅ Quality model loaded successfully (PyTorch)")
        else:
            print("⚠️ Quality model not found, using simulation")
            
    except Exception as e:
        print(f"❌ Error initializing models: {e}")

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'disease_model': disease_predictor is not None,
        'quality_model': quality_predictor is not None
    })

@app.route('/predict/disease', methods=['POST'])
def predict_disease():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
            
        image_file = request.files['image']
        
        if disease_predictor:
            # Use real model
            result = disease_predictor.predict(image_file)
        else:
            # Use simulation
            result = {
                'disease': 'Tizón tardío',
                'confidence': 92.3,
                'risk_level': 'Alto riesgo',
                'symptoms': 'Manchas marrones irregulares con bordes amarillos, presencia de esporulación blanca en el envés de la hoja',
                'treatment': 'Aplicar fungicida sistémico a base de cobre, mejorar la ventilación del cultivo, reducir la humedad relativa',
                'prevention': 'Rotación de cultivos, uso de variedades resistentes, manejo adecuado del riego'
            }
            
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/predict/quality', methods=['POST'])
def predict_quality():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
            
        image_file = request.files['image']
        
        if quality_predictor:
            # Use real model
            result = quality_predictor.predict(image_file)
        else:
            # Use simulation
            result = {
                'quality': 'Premium',
                'confidence': 89.7,
                'grade': 'A+',
                'characteristics': {
                    'color': 'Excelente - Verde uniforme',
                    'texture': 'Óptima - Sin defectos visibles',
                    'size': 'Adecuado - Dentro de parámetros',
                    'freshness': 'Muy fresco - Sin signos de deterioro'
                },
                'recommendations': 'Producto listo para comercialización premium. Mantener cadena de frío.'
            }
            
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    initialize_predictors()
    print("🚀 Starting Flask server on http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
