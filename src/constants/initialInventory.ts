
import { Car } from '../types/types.ts';

export const initialInventoryData: Omit<Car, 'id'>[] = [
    {
        name: 'Hyundai Tucson 2026',
        price: 39500,
        type: 'suv',
        badge: 'Rediseñado',
        img: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=1200&auto=format&fit=crop', // Accurate Tucson model
        featured: true,
    },
    {
        name: 'Hyundai Elantra 2026',
        price: 28900,
        type: 'sedan',
        badge: 'Deportivo',
        img: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=1200&auto=format&fit=crop', // Sleek Elantra look
        featured: true,
    },
    {
        name: 'Hyundai Venue 2026',
        price: 24500,
        type: 'suv',
        badge: 'Compacto',
        img: 'https://images.unsplash.com/photo-1672820415487-c534a8ee22ff?q=80&w=1200&auto=format&fit=crop', // Compact SUV vibe
        featured: false,
    },
    {
        name: 'Hyundai Santa Fe 2026',
        price: 44200,
        type: 'suv',
        badge: 'Más Espacio',
        img: 'https://images.unsplash.com/photo-1646728502468-06d9c7b3c2c2?q=80&w=1200&auto=format&fit=crop', // Modern Santa Fe
        featured: true,
    },
    {
        name: 'Hyundai Palisade 2026',
        price: 58900,
        type: 'luxury',
        badge: 'Flagship',
        img: 'https://images.unsplash.com/photo-1621112904887-419379ce6824?q=80&w=1200&auto=format&fit=crop', // Premium SUV
        featured: true,
    },
    {
        name: 'Hyundai Kona 2026',
        price: 34500,
        type: 'suv',
        badge: 'Electrizante',
        img: 'https://images.unsplash.com/photo-1672278374378-8ef184d2e685?q=80&w=1200&auto=format&fit=crop', // Verified Kona model
        featured: false,
    }
];
