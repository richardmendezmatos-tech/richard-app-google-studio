/**
 * STATIC_INVENTORY_FALLBACK
 * Richard Automotive G-Matrix Units
 * Provides high-quality fallback data when the primary Java backend is unreachable.
 */
export const STATIC_INVENTORY_FALLBACK = [
  {
    id: 'fallback-1',
    make: 'Porsche',
    model: '911 Carrera S',
    year: 2024,
    price: 125900,
    img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2600&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=1964&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=2600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2600&auto=format&fit=crop'
    ],
    features: ['Sport Chrono', 'PDK', 'Bose Surround'],
    dealer: 'Richard Automotive HQ',
    status: 'AVAILABLE (SENTINEL RESERVED)'
  },
  {
    id: 'fallback-2',
    make: 'Mercedes-Benz',
    model: 'G-Class G63 AMG',
    year: 2023,
    price: 189500,
    img: 'https://images.unsplash.com/photo-1520031441872-265e4ff70366?q=80&w=2600&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1520031441872-265e4ff70366?q=80&w=2600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542362567-b058c02b9ac1?q=80&w=2600&auto=format&fit=crop'
    ],
    features: ['Night Package', 'Burmester', 'G-Manufaktur'],
    dealer: 'Richard Automotive HQ',
    status: 'AVAILABLE (SENTINEL RESERVED)'
  },
  {
    id: 'fallback-3',
    make: 'Audi',
    model: 'RS e-tron GT',
    year: 2024,
    price: 147200,
    img: 'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?q=80&w=2600&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?q=80&w=2600&auto=format&fit=crop'
    ],
    features: ['Electric Performance', 'Bang & Olufsen'],
    dealer: 'Richard Automotive HQ',
    status: 'AVAILABLE (SENTINEL RESERVED)'
  },
  {
    id: 'fallback-ford-1',
    make: 'Ford',
    model: 'Mustang GT California Special',
    year: 2026,
    price: 76995,
    img: '/inventory/ford/mustang-gt-cs.png',
    images: ['/inventory/ford/mustang-gt-cs.png'],
    features: ['CS Pkg', 'Active Exhaust', 'Brembo'],
    dealer: 'Central Ford Vega Alta',
    status: 'AVAILABLE (SENTINEL RESERVED)'
  },
  {
    id: 'fallback-ford-2',
    make: 'Ford',
    model: 'F-150 Raptor R',
    year: 2026,
    price: 159995,
    img: '/inventory/ford/f150-raptor-r.png',
    images: ['/inventory/ford/f150-raptor-r.png'],
    features: ['800hp V8', '37 Pkg', 'Carbonized Gray'],
    dealer: 'Central Ford Vega Alta',
    status: 'AVAILABLE (SENTINEL RESERVED)'
  },
  {
    id: 'fallback-ford-3',
    make: 'Ford',
    model: 'Ranger STX Canopy',
    year: 2025,
    price: 49995,
    img: '/inventory/ford/ranger-stx-canopy.png',
    images: ['/inventory/ford/ranger-stx-canopy.png'],
    features: ['Canopy/Bed Shell', 'STX Appearance', '4x4'],
    dealer: 'Central Ford Vega Alta',
    status: 'AVAILABLE (SENTINEL RESERVED)'
  }
];
