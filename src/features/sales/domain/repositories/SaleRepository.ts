import { Venta } from '../domain/Venta';

export interface SaleRepository {
  executeTransaction(saleData: Omit<Venta, 'id' | 'fechaVenta'>): Promise<string>;
  isUnidadAvailable(unidadId: string): Promise<boolean>;
}
