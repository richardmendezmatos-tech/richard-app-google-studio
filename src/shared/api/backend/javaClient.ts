import { Car } from '@/entities/inventory';

const JAVA_BACKEND_URL = process.env.JAVA_BACKEND_URL || 'https://api-java-gcp.richard-automotive.com';

export async function fetchInventoryFromJava(limit: number = 10): Promise<Car[]> {
  const response = await fetch(`${JAVA_BACKEND_URL}/v1/inventory?limit=${limit}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Internal-Token': process.env.INTERNAL_API_KEY || '',
    },
    // Al ser SSR, podemos usar tags para revalidación bajo demanda
    next: { tags: ['inventory'], revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch inventory from Java Backend');
  }

  return response.json();
}

export async function submitLeadToJava(leadData: any) {
  const response = await fetch(`${JAVA_BACKEND_URL}/v1/leads`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(leadData),
  });

  return response.json();
}
