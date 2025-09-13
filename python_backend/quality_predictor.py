import tensorflow as tf
import numpy as np
from PIL import Image
import io

class QualityPredictor:
    def __init__(self, model_path):
        """Initialize the quality predictor with your trained model"""
        self.model = tf.keras.models.load_model(model_path)
        
        # Your quality classes (adjust based on your training)
        self.quality_classes = [
            'Premium',
            'Buena',
            'Regular', 
            'Defectuosa'
        ]
        
        # Quality information database
        self.quality_info = {
            'Premium': {
                'grade': 'A+',
                'characteristics': {
                    'color': 'Excelente - Verde uniforme y vibrante',
                    'texture': 'Óptima - Sin defectos visibles',
                    'size': 'Ideal - Dentro de parámetros premium',
                    'freshness': 'Muy fresco - Sin signos de deterioro'
                },
                'recommendations': 'Producto listo para comercialización premium. Mantener cadena de frío.'
            },
            'Buena': {
                'grade': 'A',
                'characteristics': {
                    'color': 'Bueno - Verde adecuado con ligeras variaciones',
                    'texture': 'Buena - Defectos menores aceptables',
                    'size': 'Adecuado - Dentro de rangos comerciales',
                    'freshness': 'Fresco - Condición comercial aceptable'
                },
                'recommendations': 'Apto para comercialización estándar. Procesar en corto plazo.'
            },
            'Regular': {
                'grade': 'B',
                'characteristics': {
                    'color': 'Regular - Variaciones notables en coloración',
                    'texture': 'Aceptable - Algunos defectos visibles',
                    'size': 'Variable - Fuera de algunos parámetros',
                    'freshness': 'Moderado - Signos iniciales de deterioro'
                },
                'recommendations': 'Apto para procesamiento industrial. No recomendado para venta fresca.'
            },
            'Defectuosa': {
                'grade': 'C',
                'characteristics': {
                    'color': 'Deficiente - Decoloración significativa',
                    'texture': 'Pobre - Múltiples defectos evidentes',
                    'size': 'Inadecuado - Fuera de parámetros',
                    'freshness': 'Deteriorado - Signos avanzados de deterioro'
                },
                'recommendations': 'No apto para comercialización. Descartar o compostar.'
            }
        }
    
    def preprocess_image(self, image_file):
        """Preprocess image for model prediction"""
        # Read image
        image = Image.open(io.BytesIO(image_file.read()))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize to model input size (adjust based on your model)
        image = image.resize((224, 224))  # Common size, adjust if needed
        
        # Convert to array and normalize
        image_array = np.array(image) / 255.0
        
        # Add batch dimension
        image_array = np.expand_dims(image_array, axis=0)
        
        return image_array
    
    def predict(self, image_file):
        """Make prediction on uploaded image"""
        try:
            # Preprocess image
            processed_image = self.preprocess_image(image_file)
            
            # Make prediction
            predictions = self.model.predict(processed_image)
            
            # Get predicted class and confidence
            predicted_class_idx = np.argmax(predictions[0])
            confidence = float(predictions[0][predicted_class_idx]) * 100
            
            predicted_quality = self.quality_classes[predicted_class_idx]
            
            # Get quality information
            quality_data = self.quality_info.get(predicted_quality, {
                'grade': 'N/A',
                'characteristics': {
                    'color': 'Información no disponible',
                    'texture': 'Información no disponible',
                    'size': 'Información no disponible',
                    'freshness': 'Información no disponible'
                },
                'recommendations': 'Consultar especialista'
            })
            
            return {
                'quality': predicted_quality,
                'confidence': round(confidence, 1),
                'grade': quality_data['grade'],
                'characteristics': quality_data['characteristics'],
                'recommendations': quality_data['recommendations']
            }
            
        except Exception as e:
            raise Exception(f"Error in prediction: {str(e)}")
