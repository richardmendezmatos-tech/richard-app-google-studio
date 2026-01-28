#!/bin/bash
# Richard Automotive 2026: Local Build Orchestrator
# Este script sincroniza tu SDK local con el nuevo motor Java 21

echo "🚀 Iniciando Orquestación Local de Richard Automotive..."

# 1. Vincular el SDK físico de tu Mac
echo "sdk.dir=$HOME/Library/Android/sdk" > android/local.properties

# 2. Localizar el JDK 21 de Homebrew
JAVA21_PATH="/opt/homebrew/Cellar/openjdk@21/21.0.10/libexec/openjdk.jdk/Contents/Home"

if [ -d "$JAVA21_PATH" ]; then
    export JAVA_HOME="$JAVA21_PATH"
    echo "✅ Motor Java 21 Detectado."
else
    echo "❌ Error: No encontré Java 21 en la ruta de Homebrew."
    echo "Intenta: brew install openjdk@21"
    exit 1
fi

# 3. Lanzar Compilación
npx cap sync android
find android/app/src/main/assets/public -name "*.gz" -delete || true
cd android
./gradlew clean assembleDebug

echo "🏁 Proceso Finalizado. Tu APK está en: android/app/build/outputs/apk/debug/app-debug.apk"
