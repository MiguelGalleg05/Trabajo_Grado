import tensorflow as tf
import numpy as np
from PIL import Image
import io

class DiseasePredictor:
    def __init__(self, model_path):
        """Initialize the disease predictor with your trained model"""
        self.model = tf.keras.models.load_model(model_path)
        
        # Your disease classes (from your training)
        self.disease_classes = [
            'Mancha bacteriana',
            'Tizón temprano', 
            'Hoja sana',
            'Tizón tardío',
            'Moho de la hoja',
            'Mancha foliar por Septoria',
            'Ácaros araña (Araña roja de dos manchas)',
            'Mancha de objetivo',
            'Virus del mosaico del tomate',
            'Virus del rizado amarillo de la hoja del tomate'
        ]
        
        # Disease information database
        self.disease_info = {
            'Mancha bacteriana': {
                'risk_level': 'Alto riesgo',
                'symptoms': 'Manchas pequeñas, oscuras y acuosas en hojas, tallos y frutos',
                'treatment': 'Aplicar bactericidas a base de cobre, eliminar plantas infectadas',
                'prevention': 'Evitar riego por aspersión, usar semillas certificadas, rotación de cultivos'
            },
            'Tizón temprano': {
                'risk_level': 'Medio riesgo',
                'symptoms': 'Manchas circulares con anillos concéntricos, amarillamiento de hojas',
                'treatment': 'Fungicidas preventivos, mejorar ventilación, reducir humedad',
                'prevention': 'Espaciamiento adecuado, evitar estrés hídrico, fertilización balanceada'
            },
            'Hoja sana': {
                'risk_level': 'Sin riesgo',
                'symptoms': 'No se detectan síntomas de enfermedad',
                'treatment': 'Mantener prácticas de manejo preventivo',
                'prevention': 'Continuar con programa de monitoreo regular'
            },
            'Tizón tardío': {
                'risk_level': 'Alto riesgo',
                'symptoms': 'Manchas marrones irregulares con bordes amarillos, esporulación blanca',
                'treatment': 'Fungicida sistémico a base de cobre, mejorar ventilación, reducir humedad',
                'prevention': 'Rotación de cultivos, variedades resistentes, manejo del riego'
            },
            'Moho de la hoja': {
                'risk_level': 'Medio riesgo',
                'symptoms': 'Manchas amarillas en haz, crecimiento aterciopelado en envés',
                'treatment': 'Fungicidas específicos, mejorar circulación de aire',
                'prevention': 'Control de humedad, espaciamiento adecuado entre plantas'
            },
            'Mancha foliar por Septoria': {
                'risk_level': 'Medio riesgo',
                'symptoms': 'Pequeñas manchas circulares con centro gris y borde oscuro',
                'treatment': 'Fungicidas preventivos, eliminación de hojas afectadas',
                'prevention': 'Evitar salpicaduras de agua, mulching, rotación de cultivos'
            },
            'Ácaros araña (Araña roja de dos manchas)': {
                'risk_level': 'Alto riesgo',
                'symptoms': 'Punteado amarillo en hojas, telarañas finas, decoloración',
                'treatment': 'Acaricidas específicos, aumento de humedad relativa',
                'prevention': 'Monitoreo regular, control biológico, evitar estrés hídrico'
            },
            'Mancha de objetivo': {
                'risk_level': 'Medio riesgo',
                'symptoms': 'Manchas circulares con anillos concéntricos tipo diana',
                'treatment': 'Fungicidas preventivos, eliminación de tejido infectado',
                'prevention': 'Rotación de cultivos, manejo de residuos, ventilación adecuada'
            },
            'Virus del mosaico del tomate': {
                'risk_level': 'Alto riesgo',
                'symptoms': 'Patrón de mosaico verde claro y oscuro, deformación de hojas',
                'treatment': 'No hay tratamiento curativo, eliminar plantas infectadas',
                'prevention': 'Control de vectores, uso de semillas certificadas, desinfección de herramientas'
            },
            'Virus del rizado amarillo de la hoja del tomate': {
                'risk_level': 'Alto riesgo',
                'symptoms': 'Amarillamiento y rizado hacia arriba de hojas, enanismo',
                'treatment': 'Eliminar plantas infectadas, control de mosca blanca',
                'prevention': 'Control de vectores, uso de mallas, variedades resistentes'
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
            
            predicted_disease = self.disease_classes[predicted_class_idx]
            
            # Get disease information
            disease_data = self.disease_info.get(predicted_disease, {
                'risk_level': 'Desconocido',
                'symptoms': 'Información no disponible',
                'treatment': 'Consultar especialista',
                'prevention': 'Aplicar medidas preventivas generales'
            })
            
            return {
                'disease': predicted_disease,
                'confidence': round(confidence, 1),
                'risk_level': disease_data['risk_level'],
                'symptoms': disease_data['symptoms'],
                'treatment': disease_data['treatment'],
                'prevention': disease_data['prevention']
            }
            
        except Exception as e:
            raise Exception(f"Error in prediction: {str(e)}")
