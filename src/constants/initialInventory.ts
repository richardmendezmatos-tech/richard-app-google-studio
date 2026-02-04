
import { Car } from '@/types/types';

export const initialInventoryData: Omit<Car, 'id'>[] = [
    {
        name: 'Hyundai Tucson 2026',
        price: 39500,
        type: 'suv',
        badge: 'Rediseñado',
        img: 'https://images.unsplash.com/photo-1695221971766-3d778d910dc7?q=80&w=1200&auto=format&fit=crop',
        featured: true,
    },
    {
        name: 'Hyundai Elantra 2026',
        price: 28900,
        type: 'sedan',
        badge: 'Deportivo',
        img: 'https://images.unsplash.com/photo-1609520505218-7421da3b3d80?q=80&w=1200&auto=format&fit=crop', // White Sedan
        featured: true,
    },
    {
        name: 'Hyundai Venue 2026',
        price: 24500,
        type: 'suv',
        badge: 'Compacto',
        img: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?q=80&w=1200&auto=format&fit=crop', // Compact SUV vibe
        featured: false,
    },
    {
        name: 'Hyundai Santa Fe 2026',
        price: 44200,
        type: 'suv',
        badge: 'Más Espacio',
        img: 'https://images.unsplash.com/photo-1631522858632-1b157bd752e2?q=80&w=1200&auto=format&fit=crop',
        featured: true,
    },
    {
        name: 'Hyundai Palisade 2026',
        price: 58900,
        type: 'luxury',
        badge: 'Flagship',
        img: 'https://images.unsplash.com/photo-1647494480572-c2834b6e56ad?q=80&w=1200&auto=format&fit=crop',
        featured: true,
    },
];
