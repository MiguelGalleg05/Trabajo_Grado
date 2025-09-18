import tensorflow as tf

model_path = r"C:\Users\MIGUEL GALLEGO\Proyecto\Trabajo_Grado\python_backend\models\mymodel_v3.keras"

try:
    model = tf.keras.models.load_model(model_path, compile=False)
    model.summary()
except Exception as e:
    print("❌ Error cargando modelo:", e)
