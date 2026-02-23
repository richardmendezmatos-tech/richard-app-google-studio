import { Lead, Car, MarginAdjustment } from '../../domain/entities';

export class CalculateDynamicMargin {
    async execute(lead: Lead, car: Car): Promise<MarginAdjustment> {
        const score = lead.predictiveScore || 50;
        const daysInStock = this.getDaysInStock(car);

        let discountPercent = 0;

        // Logic: 
        // 1. If lead is high probability (>90) and car is old (>30 days), offer aggressive discount to close.
        if (score > 90 && daysInStock > 30) {
            discountPercent = 0.05; // 5% discount
        } else if (score > 80 && daysInStock > 15) {
            discountPercent = 0.03; // 3% discount
        } else if (score < 30) {
            // Low probability lead, keep margin high
            discountPercent = 0;
        }

        const basePrice = car.price || 0;
        const discountAmount = basePrice * discountPercent;
        const adjustedPrice = basePrice - discountAmount;

        return {
            leadId: lead.id,
            inventoryId: car.id,
            basePrice,
            adjustedPrice,
            allowedDiscount: discountAmount,
            reason: this.generateReason(score, daysInStock, discountPercent),
            confidenceScore: 0.9
        };
    }

    private getDaysInStock(car: Car): number {
        // Mocking for now, in real scenario we'd check created_at
        return 20;
    }

    private generateReason(score: number, days: number, discount: number): string {
        if (discount > 0) {
            return `Aprobado ajuste de margen del ${(discount * 100).toFixed(0)}% para Lead de alta probabilidad (${score}%) con unidad en stock por ${days} días.`;
        }
        return "Mantener margen estándar: probabilidad estable o inventario de alta rotación.";
    }
}
