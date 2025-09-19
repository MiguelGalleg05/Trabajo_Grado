import os
import io
from ultralytics import YOLO
from PIL import Image

class QualityPredictor:
    def __init__(self, model_path):
        """Inicializa el predictor de calidad/madurez con YOLOv8"""
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"❌ No se encontró el modelo YOLO en {model_path}")
        self.model = YOLO(model_path)
        print(f"✅ Modelo YOLO cargado: {model_path}")

    def predict(self, image_file):
        try:
            # Leer imagen
            image = Image.open(io.BytesIO(image_file.read()))

            # Ejecutar YOLO
            results = self.model.predict(image, imgsz=640, conf=0.5)

            detections = []
            for r in results:
                for box in r.boxes:
                    cls_id = int(box.cls[0])
                    conf = float(box.conf[0])
                    detections.append({
                        "class": self.model.names[cls_id],
                        "confidence": round(conf * 100, 2),
                        "bbox": box.xyxy[0].tolist()
                    })

            return {
                "detections": detections,
                "total": len(detections)
            }
        except Exception as e:
            raise Exception(f"❌ Error en predicción YOLO: {str(e)}")
