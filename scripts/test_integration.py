from main import inicializar_sistema

def test_connections():
    print("🔄 Iniciando pruebas de integración...")
    
    try:
        client, db = inicializar_sistema()
        print("✅ Credenciales cargadas y cliente inicializado.")
    except Exception as e:
        print(f"❌ Error inicializando: {e}")
        return

    # 1. Test Firestore
    try:
        print("\n🔥 Probando conexión a Firestore...")
        # Intentar leer la colección de 'cars'
        cars = list(db.collection('cars').limit(1).stream())
        if cars:
            car_data = cars[0].to_dict()
            print(f"✅ Conexión Exitosa. Auto encontrado: {car_data.get('make', 'Desconocido')} {car_data.get('model', '')}")
        else:
            print("✅ Conexión Exitosa (Colección 'cars' vacía o no encontrada).")
    except Exception as e:
        print(f"❌ Error leyendo Firestore: {e}")

    # 2. Test Gemini
    try:
        print("\n🧠 Probando conexión a Gemini AI...")
        # Check supported models
        # for model in client.models.list(config={"page_size": 10}):
        #    print(model.name)
        
        response = client.models.generate_content(
            model='gemini-1.5-flash', # Actualizado desde gemini-2.0-flash-exp
            contents='Responde solo con: "Conexión a Gemini exitosa 🚀"'
        )
        print(f"✅ Respuesta de Gemini: {response.text}")
    except Exception as e:
        print(f"❌ Error conectando a Gemini: {e}")
        print("💡 Intentando con 'gemini-1.5-pro'...")
        try: 
             response = client.models.generate_content(
                model='gemini-1.5-pro',
                contents='Responde solo con: "Conexión a Gemini exitosa 🚀"'
            )
             print(f"✅ Respuesta de Gemini: {response.text}")
        except Exception as e2:
             print(f"❌ Error final: {e2}")

if __name__ == "__main__":
    test_connections()
