# Jules Sync Mandate

Este archivo contiene el mandato oficial generado por Antigravity (Supervisor) para ser ejecutado por Jules (Delegado) en el ecosistema de Richard Automotive.

## Comando de Ejecución (Comando a ejecutar interactivamente con Jules)

\`\`\`bash
@jules update dependencies --plan /Users/richardmendez/.gemini/antigravity/brain/2257158f-f2bd-4b46-ac49-9fc83a49c285/implementation_plan.md --verify
\`\`\`

## Directrices para el Delegado (Jules)

1. **Scope:** Realizar un escaneo y actualización de dependencias (`package.json`).
2. **Restricciones:** No tocar la configuración de `framer-motion` ni de `firebase/firestore`.
3. **CI/CD:** Asegurarse de que el PR pase los tests unitarios (`npm run test`) antes de solicitar el _merge_.
4. **Validación:** Antigravity correrá una validación de dependencias tras el PR.
