// src/features/inventory-sync/domain/entities/Vehicle.ts
import { VIN } from './VIN';

export type SyncStatus = 'AVAILABLE' | 'SOLD' | 'ARCHIVED' | 'PENDING';

export interface VehicleProps {
  make: string;
  model: string;
  year: number;
  price: number;
  trim?: string;
  exteriorColor?: string;
  interiorColor?: string;
  engine?: string;
  transmission?: string;
  driveTrain?: string;
  bodyStyle?: string;
  mileage: number;
  images: string[];
  status: SyncStatus;
  condition: 'NEW' | 'USED';
  lastScrapedAt: Date;
}

export class Vehicle {
  private readonly _vin: VIN;
  private _props: VehicleProps;

  private constructor(vin: VIN, props: VehicleProps) {
    this._vin = vin;
    this._props = props;
  }

  public static create(vinStr: string, props: VehicleProps): Vehicle {
    const vin = VIN.create(vinStr);
    
    if (props.price < 0) {
      throw new Error(`Dominio: El precio no puede ser negativo (${vinStr})`);
    }

    return new Vehicle(vin, {
      ...props,
      make: props.make.trim(),
      model: props.model.trim(),
    });
  }

  get vin(): string {
    return this._vin.getValue();
  }

  get props(): Readonly<VehicleProps> {
    return Object.freeze({ ...this._props });
  }
  
  get price(): number {
    return this._props.price;
  }

  get status(): SyncStatus {
    return this._props.status;
  }

  public markAsSold(): void {
    this._props.status = 'SOLD';
  }

  public updatePrice(newPrice: number): void {
    if (newPrice < 0) throw new Error('Precio inválido');
    this._props.price = newPrice;
  }
}
