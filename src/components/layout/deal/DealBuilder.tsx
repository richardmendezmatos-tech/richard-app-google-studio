/**
 * DealBuilder — re-export desde el componente canónico (features/inventory)
 * @canonical src/features/inventory/components/deal/DealBuilder
 *
 * DRY: Ambas versiones eran byte-a-byte idénticas.
 * Este archivo es el punto de entrada para quien importe desde src/components/layout/deal.
 * La implementación única vive en features/inventory/components/deal/DealBuilder.
 */
export { default } from '@/features/inventory/components/deal/DealBuilder';
