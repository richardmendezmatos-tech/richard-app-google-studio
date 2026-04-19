// src/features/inventory-sync/domain/value-objects/VIN.ts

export class VIN {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  /**
   * Crea una nueva instancia de VIN asegurando que cumple con los estándares.
   * Arrojará un error si el VIN es inválido.
   */
  public static create(vin: string): VIN {
    const normalizedVin = vin.trim().toUpperCase();
    
    // Regla de Negocio: Todo VIN moderno tiene exactamente 17 caracteres alfanuméricos
    // Y no puede contener las letras I, O, o Q.
    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;

    if (!vinRegex.test(normalizedVin)) {
      throw new Error(`Dominio: Formato de VIN inválido -> ${vin}`);
    }

    return new VIN(normalizedVin);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: VIN): boolean {
    return this.value === other.getValue();
  }
}
