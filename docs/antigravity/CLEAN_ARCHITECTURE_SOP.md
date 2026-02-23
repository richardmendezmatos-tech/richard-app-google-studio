# SOP: Clean Architecture Richard Automotive (Nivel 12)

**Autor:** CTO / Arquitecto Senior (Antigravity)  
**Versión:** 1.0.0  
**Contexto:** Richard Automotive Command Center

Este documento establece las reglas sagradas para la evolución del código en Richard Automotive. Cualquier desviación de este estándar se considera una degradación técnica.

---

## 1. Mapa de Navegación (Folder Conventions)

El código se divide en tres capas concéntricas. El flujo de dependencia siempre es **hacia adentro**.

### `src/domain/` (The Heart)

El núcleo de la verdad. No conoce bases de datos, APIs ni librerías externas.

- **Entities**: Interfaces TypeScript que definen los modelos de datos maestros (e.g., `Lead`, `Car`).
- **Repositories (Interfaces)**: Los contratos que definen qué datos se necesitan, sin decir *cómo* se obtienen.
- **Value Objects**: Validadores y tipos específicos de dominio.

### `src/application/` (The Brain)

Donde vive la orquestación.

- **Use Cases**: Clases que ejecutan procesos de negocio (e.g., `ScoreCalculator`, `MatchInventory`).
- **Regla**: Solo importan del `domain`.

### `src/infrastructure/` (The Muscle)

Detalles de implementación.

- **Repositories (Implementations)**: Clones de las interfaces del dominio que usan `db.collection(...)` o `fetch(...)`.
- **Adapters**: Conexiones con Twilio, SendGrid o Genkit.

---

## 2. La Regla de Oro: Dependencia Unidireccional

> [!IMPORTANT]
> **Domain e Application NUNCA importan nada de Infrastructure.**

**¿Por qué?**
Si mañana decidimos dejar Firestore por PostgreSQL, solo modificamos la carpeta `infrastructure`. Los tests de `application` y las reglas de `domain` no cambian. Esto asegura que Richard Automotive sea agnóstico a la tecnología y extremadamente fácil de testear.

---

## 3. Workflow: Creación de un Nuevo 'Feature'

Para añadir una funcionalidad (ej. `SmartRetention`), sigue este orden:

1. **Define la Entidad** en `domain/entities.ts`.
2. **Define el Repositorio** (Interface) en `domain/repositories/`.
3. **Escribe el Use Case** en `application/use-cases/`. Inyecta el repositorio en el constructor.
4. **Implementa el Repositorio** real en `infrastructure/`.
5. **Expón el Flow** en `index.ts` instanciando los componentes.

---

## 4. Estándares de Testing (Mocking Reality)

Los Use Cases se testean sin conectarse a la realidad. Usamos el patrón de **InMemoryRepository**.

```typescript
// NO HACER: 
// test('real db', () => { await db.save(...) })

// HACER:
class MockRepo implements RepoInterface {
  async save(data) { this.saved = true }
}

it('should save lead', async () => {
  const useCase = new MyUseCase(new MockRepo());
  // ... verify logic
});
```

---

## 5. Boilerplate: `GetVehicleDetails`

### Domain Interface

```typescript
// domain/repositories/InventoryRepository.ts
export interface InventoryRepository {
    getById(id: string): Promise<Car | null>;
}
```

### Application Use Case

```typescript
// application/use-cases/GetVehicleDetails.ts
export class GetVehicleDetails {
    constructor(private repo: InventoryRepository) {}

    async execute(carId: string) {
        if (!carId) throw new Error("ID requerido");
        return await this.repo.getById(carId);
    }
}
```

### Infrastructure Implementation

```typescript
// infrastructure/repositories/FirestoreInventoryRepository.ts
export class FirestoreInventoryRepository implements InventoryRepository {
    async getById(id: string) {
        const doc = await db.collection('cars').doc(id).get();
        return doc.exists ? doc.data() as Car : null;
    }
}
```

---

## 6. Métrica de Calidad: El Sentinel 24/7

Cada flujo nuevo debe integrarse en el `raSentinel` para asegurar que el **Persistence Protocol** guarde un checkpoint del resultado.

> "Dato que no está en el Workspace, es dato que no existe."
