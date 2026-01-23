import { db } from './firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { ai } from './aiManager';

/**
 * Generates an embedding for a car object.
 * Concatenates name, type, and description for a rich semantic representation.
 */
export async function generateCarEmbedding(car: any): Promise<number[]> {
    const text = `${car.name} ${car.type} ${car.description || ''} ${car.features?.join(' ') || ''}`;
    const embeddingResponse = await ai.embed({
        embedder: 'vertexai/text-embedding-004',
        content: text,
    });
    // Cast to any since we know it's a number[] for single content in this SDK version
    return embeddingResponse as any;
}

/**
 * Updates a car document with its semantic embedding.
 */
export async function updateCarEmbedding(carId: string, carData: any) {
    const embedding = await generateCarEmbedding(carData);
    await db.collection('cars').doc(carId).update({
        embedding: FieldValue.vector(embedding),
        updatedAt: FieldValue.serverTimestamp(),
    });
}

/**
 * Performs a semantic search using cosine similarity.
 */
export async function semanticSearch(queryText: string, limit: number = 3) {
    const queryEmbedding = await ai.embed({
        embedder: 'vertexai/text-embedding-004',
        content: queryText,
    });
    const queryVector = queryEmbedding as any;

    const snapshot = await (db.collection('cars') as any)
        .findNearest('embedding', FieldValue.vector(queryVector), {
            limit: limit,
            distanceMeasure: 'COSINE'
        })
        .get();

    return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
    }));
}
