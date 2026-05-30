import React from 'react';
import {
  Baby,
  Mountain,
  Gauge,
  Wallet,
  Briefcase,
  Leaf,
  Car as CarIcon,
} from 'lucide-react';

export const LIFESTYLE_TAGS = [
  {
    id: 'family',
    label: 'Familia & Seguridad',
    icon: <Baby size={14} />,
    text: 'Priorizo la seguridad y el espacio para mi familia.',
  },
  {
    id: 'adventure',
    label: 'Aventura & Off-road',
    icon: <Mountain size={14} />,
    text: 'Me gusta salir de la carretera y necesito capacidad todoterreno.',
  },
  {
    id: 'performance',
    label: 'Velocidad & Sport',
    icon: <Gauge size={14} />,
    text: 'Busco alto rendimiento, aceleración y manejo deportivo.',
  },
  {
    id: 'commute',
    label: 'Uso Diario',
    icon: <CarIcon size={14} />,
    text: 'Necesito algo eficiente y cómodo para el tráfico diario.',
  },
  {
    id: 'budget',
    label: 'Económico',
    icon: <Wallet size={14} />,
    text: 'Mi prioridad es el ahorro de combustible y bajo costo de mantenimiento.',
  },
  {
    id: 'luxury',
    label: 'Lujo & Tech',
    icon: <Briefcase size={14} />,
    text: 'Quiero la mejor tecnología, confort premium y estatus.',
  },
  {
    id: 'eco',
    label: 'Eco-Friendly',
    icon: <Leaf size={14} />,
    text: 'Me interesa reducir mi huella de carbono (Híbrido/Eléctrico).',
  },
];
