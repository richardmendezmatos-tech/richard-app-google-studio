export interface Car {
    id: string;
    year: number;
    make: string;
    model: string;
    name: string;
    price: number;
    mileage: number;
    type: string;
    category: string;    // SUV, Sedan, Truck
    condition: string;   // New, Used, Certified
    features?: string[];
    description?: string;
    embedding?: number[];
    status?: 'available' | 'reserved' | 'sold';
    updatedAt?: Date;
    version?: string;
    daysInInventory?: number; // Campo para lógica de estancamiento
}

export class CarEntity {
    constructor(private props: Car) { }

    public get data(): Car {
        return { ...this.props };
    }

    /**
     * Calcula la deseabilidad de mercado (0-100).
     * Basado en: Depreciación (año), Millaje y Tipo de unidad.
     */
    public calculateMarketDesirability(): number {
        let score = 50; // Base neutral

        // Factores Positivos: Reciente (últimos 3 años)
        const currentYear = new Date().getFullYear();
        const age = currentYear - this.props.year;
        if (age <= 2) score += 20;
        else if (age <= 5) score += 10;

        // Factores Positivos: Millaje bajo (< 15k/año)
        const avgMileagePerYear = this.props.mileage / Math.max(age, 1);
        if (avgMileagePerYear < 12000) score += 15;

        // Factores de Mercado (Puerto Rico): SUV y Trucks tienen alta demanda
        if (['SUV', 'Pickup', 'Truck'].includes(this.props.category)) {
            score += 15;
        }

        // Factores Negativos: Precio alto (> 50k) sin ser "Certified"
        if (this.props.price > 50000 && this.props.condition !== 'Certified') {
            score -= 10;
        }

        return Math.min(Math.max(score, 0), 100);
    }

    /**
     * Identifica si la unidad tiene alto riesgo de estancamiento.
     */
    public isHighRiskOfStagnation(): boolean {
        const desirability = this.calculateMarketDesirability();
        const days = this.props.daysInInventory || 0;

        // Riesgo si: Baja deseabilidad O lleva > 45 días sin venderse
        return desirability < 40 || days > 45;
    }

    /**
     * Genera una descripción persuasiva basada en los atributos técnicos.
     */
    public getFormattedDescription(): string {
        if (this.props.description && this.props.description.length > 50) {
            return this.props.description;
        }

        const conditionText = this.props.condition === 'Certified' ? '⭐️ Certificado y Garantizado' : 'Vehículo';
        return `Increíble ${this.props.year} ${this.props.make} ${this.props.model}. ${conditionText} con solo ${this.props.mileage.toLocaleString()} millas. ¡Listo para entrega inmediata en Richard Automotive! 🦅`;
    }
}
