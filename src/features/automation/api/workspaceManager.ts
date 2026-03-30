import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { dbLite as db } from '@/shared/api/firebase/client';
import { v4 as uuidv4 } from 'uuid';

/**
 * Workspace Manager
 * Basado en el Protocolo de Persistencia de estilo.md (Fórmula de Eficiencia E_w).
 * Asegura la trazabilidad y evita la pérdida de Drafts durante Data Ingestion o
 * llamadas prolongadas a Gemini (AI).
 */
export class WorkspaceManager {
  private readonly collectionName = 'workspaces';

  /**
   * Inicializa o recupera un ID de sesión de Workspace.
   */
  startSession(existingId?: string): string {
    return existingId || uuidv4();
  }

  /**
   * Ejecuta un Checkpoint (Draft/Borrador) en Firestore.
   * "Dato que no está en el Workspace, es dato que no existe."
   *
   * @param sessionId UUID de la tarea actual
   * @param category Categoría de la tarea (ej. 'VALUACION', 'COPYWRITING', 'AI_AUDIT')
   * @param data Los datos en formato JSON o estructura plana para evitar stringify
   */
  async checkpointOperation(sessionId: string, category: string, data: Record<string, any>) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const documentId = `${today}_${category.toUpperCase()}_${sessionId}`;

      const docRef = doc(db, this.collectionName, documentId);

      // Upsert the workspace checkpoint
      await setDoc(
        docRef,
        {
          sessionId,
          category,
          data,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      console.log(`[WorkspaceManager] Checkpoint Guardado: ${documentId}`);
      return documentId;
    } catch (error) {
      console.error('[WorkspaceManager] Fallo Crítico en Checkpointing:', error);
      // No lanzamos excepcion para no bloquear el flujo principal
      // Pero idealmente debería reintentarse si P_error se penaliza.
      return null;
    }
  }

  /**
   * Recupera un Checkpoint previo para retomar una operación colgada.
   */
  async retrieveCheckpoint(documentId: string) {
    try {
      const docRef = doc(db, this.collectionName, documentId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return snapshot.data();
      }
      return null;
    } catch (error) {
      console.error('[WorkspaceManager] Error al recuperar Checkpoint:', error);
      return null;
    }
  }
}

export const workspaceManager = new WorkspaceManager();
