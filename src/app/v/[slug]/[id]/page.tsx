import React from 'react';
import { Metadata } from 'next';
import VehicleDetail from '@/pages/storefront/ui/VehicleDetail';
import { fetchInventoryFromJava } from '@/shared/api/backend/javaClient';
import { Car } from '@/entities/inventory';

interface Props {
  params: Promise<{ id: string; slug: string }>;
}

// ISR: Revalidar cada 60 segundos
export const revalidate = 60;

// SSG: Generar las rutas más populares estáticamente (opcional, basado en Java)
export async function generateStaticParams() {
  const inventory = await fetchInventoryFromJava(20);
  return inventory.map((car: Car) => ({
    id: car.id,
    slug: `${car.year}-${car.make}-${car.model}`.toLowerCase().replace(/\s+/g, '-'),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  // Fetch meta info from Java for SEO
  return {
    title: `Vehículo ID: ${id} | Richard Automotive`,
    description: 'Detalles técnicos, financiamiento y disponibilidad.',
  };
}

export default async function VehicleDetailPage({ params }: Props) {
  const { id } = await params;
  let inventory: any[] = [];

  try {
    inventory = await fetchInventoryFromJava(20);
  } catch (err) {
      console.error(err);
  }

  return (
    <VehicleDetail inventory={inventory} />
  );
}
