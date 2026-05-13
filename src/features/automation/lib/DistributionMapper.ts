import { Car } from '@/entities/inventory';
import { SITE_CONFIG } from '@/shared/config/siteConfig';

export interface ClasificadosOnlineSchema {
  titulo: string;
  precio: number;
  descripcion: string;
  fotos: string[];
  pueblo: string;
  telefono: string;
  condicion: 'Nuevo' | 'Usado';
  transmision: 'Automatica' | 'Manual';
}

export interface FacebookMarketplaceSchema {
  title: string;
  description: string;
  price: number;
  condition: 'new' | 'used' | 'like_new' | 'good' | 'fair';
  category: 'vehicles';
  images: string[];
  location: string;
}

/**
 * DistributionMapper
 * 
 * Centralizes the transformation logic for different automotive marketplaces.
 */
export class DistributionMapper {
  static toClasificadosOnline(car: Car): ClasificadosOnlineSchema {
    return {
      titulo: `${car.year} ${car.make} ${car.model}${car.trim ? ` ${car.trim}` : ''}`,
      precio: car.price || 0,
      descripcion: car.description || `${car.make} ${car.model} disponible en Richard Automotive.`,
      fotos: car.images || (car.img ? [car.img] : []),
      pueblo: SITE_CONFIG.contact.address.split(',')[0].trim() || 'Vega Alta',
      telefono: SITE_CONFIG.contact.phone,
      condicion: car.condition === 'new' ? 'Nuevo' : 'Usado',
      transmision: (car.transmission || 'Automatic').toLowerCase().includes('man') ? 'Manual' : 'Automatica',
    };
  }

  static toFacebook(car: Car): FacebookMarketplaceSchema {
    return {
      title: `${car.year} ${car.make} ${car.model}`,
      description: car.description || `Excelente ${car.make} ${car.model} ${car.year}. Financiamiento disponible.`,
      price: car.price || 0,
      condition: car.condition === 'new' ? 'new' : 'used',
      category: 'vehicles',
      images: car.images || (car.img ? [car.img] : []),
      location: SITE_CONFIG.contact.address,
    };
  }
}
