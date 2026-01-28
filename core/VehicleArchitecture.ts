/**
 * DEMO TÉCNICA: ARQUITECTURA POO ROBUSTA
 * --------------------------------------
 * Aplicando los 4 Pilares para un sistema de inventario escalable.
 */

// 1. ABSTRACCIÓN 🎨
// Definimos el "qué" debe hacer un vehículo, sin importar el "cómo".
// Ocultamos la complejidad de la implementación.
export abstract class Vehicle {
    constructor(
        protected _id: string,       // Protected: Visible para clases hijas (Herencia)
        protected _price: number,
        private _vin: string         // Private: Solo visible en esta clase (Encapsulamiento fuerte)
    ) { }

    // Contrato: Todo vehículo debe saber calcular su impuesto, pero cada uno lo hace distinto.
    abstract calculateTax(): number;

    // Método concreto compartido
    getDetails(): string {
        return `VIN: ${this.maskVin()} | Precio: $${this._price}`;
    }

    // 2. ENCAPSULAMIENTO 🔒
    // Controlamos el acceso al VIN. Nadie fuera de esta clase puede verlo crudo.
    private maskVin(): string {
        return `***-${this._vin.slice(-4)}`;
    }

    // Getter seguro
    get id(): string { return this._id; }
}

// 3. HERENCIA 🧬
// Reutilizamos la lógica base de Vehicle y extendemos especializaciones.

export class ElectricCar extends Vehicle {
    private _batteryCapacity: number;

    constructor(id: string, price: number, vin: string, battery: number) {
        super(id, price, vin);
        this._batteryCapacity = battery;
    }

    // 4. POLIMORFISMO 🎭
    // Implementación específica: Los eléctricos tienen incentivos fiscales (0 impuestos).
    calculateTax(): number {
        return 0;
    }
}

export class LuxuryCar extends Vehicle {
    // Polimorfismo: Los autos de lujo pagan impuesto de lujo (20%).
    calculateTax(): number {
        return this._price * 0.20;
    }
}

export class StandardCar extends Vehicle {
    // Polimorfismo: Autos estándar pagan impuesto base (10%).
    calculateTax(): number {
        return this._price * 0.10;
    }
}

// Factoría para demostrar el uso flexible (Pattern Factory)
export class DealershipSystem {
    static processSalesTax(inventory: Vehicle[]): number {
        return inventory.reduce((total, car) => {
            // Polimorfismo en acción: No sabemos qué tipo de auto es, 
            // pero sabemos que responderá correctamente a calculateTax()
            return total + car.calculateTax();
        }, 0);
    }
}
