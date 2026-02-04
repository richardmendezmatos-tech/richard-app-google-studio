import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Car } from '@/types/types';

interface VehicleSchemaProps {
    car: Car;
}

export const VehicleSchema: React.FC<VehicleSchemaProps> = ({ car }) => {
    // Extract make and model from car.name (e.g., "2024 Toyota Camry")
    const nameParts = car.name.split(' ');
    const year = car.year || parseInt(nameParts[0]) || 2025;
    const make = nameParts[1] || 'Auto';
    const model = nameParts.slice(2).join(' ') || car.name;

    const schema = {
        "@context": "https://schema.org",
        "@type": "Car",
        "name": car.name,
        "brand": {
            "@type": "Brand",
            "name": make
        },
        "model": model,
        "vehicleModelDate": year.toString(),
        "offers": {
            "@type": "Offer",
            "price": car.price,
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock",
            "seller": {
                "@type": "AutoDealer",
                "name": "Richard Automotive"
            }
        },
        "image": car.img,
        "description": car.description || `${car.name} disponible en Richard Automotive. ${car.features?.slice(0, 3).join(', ') || 'Excelente condición'}.`
    };

    return (
        <Helmet>
            <script type="application/ld+json">
                {JSON.stringify(schema)}
            </script>
        </Helmet>
    );
};

