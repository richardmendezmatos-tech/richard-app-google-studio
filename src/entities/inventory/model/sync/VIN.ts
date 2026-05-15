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
    if (!vin || typeof vin !== 'string') {
      throw new Error('Dominio: El VIN es requerido y debe ser una cadena de texto.');
    }

    // Soft normalization for OCR errors (Nivel 16 Resilience)
    const normalizedVin = vin.trim().toUpperCase()
      .replace(/I/g, '1')
      .replace(/O/g, '0')
      .replace(/Q/g, '0');
    
    // Regla de Negocio: Todo VIN moderno tiene exactamente 17 caracteres alfanuméricos
    // Y no puede contener las letras I, O, o Q (corregidas arriba).
    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;

    if (!vinRegex.test(normalizedVin)) {
      throw new Error(`Dominio: VIN Inválido (${normalizedVin}). Debe tener 17 caracteres y sin letras I, O, Q.`);
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
