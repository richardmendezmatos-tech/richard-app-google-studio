import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/shared/api/firebase/client';
import { BlogPost } from '@/shared/types/types';

const COLLECTION_NAME = 'blog_posts';

export const blogService = {
  /**
   * Obtiene los posts del blog ordenados por fecha de creación descendente.
   */
  async getBlogPosts(maxResults = 50): Promise<BlogPost[]> {
    const q = query(collection(db, COLLECTION_NAME), orderBy('date', 'desc'), limit(maxResults));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (docSnap) =>
        ({
          id: docSnap.id,
          ...docSnap.data(),
        }) as BlogPost,
    );
  },

  /**
   * Guarda un nuevo artículo generado en Firestore.
   */
  async createBlogPost(post: Omit<BlogPost, 'id'>): Promise<BlogPost> {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...post,
      createdAt: serverTimestamp(),
    });
    return {
      id: docRef.id,
      ...post,
    };
  },

  /**
   * Elimina un artículo del inventario de noticias.
   */
  async deleteBlogPost(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  },
};
