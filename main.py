import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore
from google import genai

# Cargar variables desde el archivo .env
load_dotenv()

def inicializar_sistema():
    # Obtener llaves de las variables de entorno
    api_key = os.getenv("GEMINI_API_KEY")
    json_path = os.getenv("FIREBASE_SERVICE_ACCOUNT")

    if not api_key or not json_path:
        raise ValueError("❌ Faltan las llaves en el archivo .env")

    # Inicializar Gemini
    client = genai.Client(api_key=api_key)

    # Inicializar Firebase
    cred = credentials.Certificate(json_path)
    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)
    db = firestore.client()
    
    return client, db

if __name__ == "__main__":
    try:
        # Ahora tu lógica de negocio es más limpia y segura
        client, db = inicializar_sistema()
        print("✅ Sistema seguro y conectado.")
    except Exception as e:
        print(f"❌ Error al iniciar el sistema: {e}")
