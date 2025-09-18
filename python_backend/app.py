from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from predictor_disease import DiseasePredictor


app = Flask(__name__)
CORS(app)

# Initialize predictor
disease_predictor = None

def initialize_predictor():
    global disease_predictor
    try:
        # ✅ Cargar directamente el modelo mymodel_v4.keras
        models_dir = os.path.join(os.path.dirname(__file__), "models")
        disease_model_path = os.path.join(models_dir, "mymodel_v4.keras")

        if os.path.exists(disease_model_path):
            disease_predictor = DiseasePredictor(disease_model_path)
            print("✅ Disease model loaded successfully (mymodel_v4.keras)")
        else:
            print(f"❌ Disease model not found in {models_dir}")

    except Exception as e:
        print(f"❌ Error initializing model: {e}")

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'disease_model': disease_predictor is not None
    })

@app.route('/predict/disease', methods=['POST'])
def predict_disease():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400

        if disease_predictor is None:
            return jsonify({'error': '❌ No se pudo establecer conexión con el modelo de enfermedades'}), 500

        image_file = request.files['image']
        result = disease_predictor.predict(image_file)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': f'❌ Error en predicción de enfermedades: {str(e)}'}), 500

if __name__ == '__main__':
    initialize_predictor()
    print("🚀 Starting Flask server on http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
