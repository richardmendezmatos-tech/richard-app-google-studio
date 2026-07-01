/**
 * Tipos y datos por defecto de las reseñas GBP (Google Business Profile).
 * Extraídos a su propio módulo para que SentinelLocalSEO y SentinelReviewsTab
 * los importen sin crear una dependencia circular entre componentes.
 */

export interface GBPReview {
  id: string;
  name: string;
  text: string;
  stars: number;
  createTime: string;
}

export const defaultReviews: GBPReview[] = [
  { id: '1', name: 'Carlos Rivera', text: 'Excelente servicio, Richard me ayudó en todo el proceso...', stars: 5, createTime: '' },
  { id: '2', name: 'Marta Ortiz', text: 'La Tacoma que compré está impecable. Recomendado.', stars: 5, createTime: '' },
  { id: '3', name: 'Jose Davila', text: 'Esperaba un poco más de rapidez en la entrega, pero el auto está bien.', stars: 3, createTime: '' },
];
