import { LeadStatus } from '../types';
import { LeadSchema } from '../validators/lead.schema';

export interface Lead {
  id?: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  monthlyIncome?: string;
  timeAtJob?: string;
  jobTitle?: string;
  employer?: string;
  vehicleId?: string;
  hasPronto?: boolean;
  ssn?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  housingType?: string;
  timeAtAddress?: string;
  timeAtEmployer?: string;
  hasCreditApplication?: boolean;
  chatInteractions?: number;
  viewedInventoryMultipleTimes?: boolean;
  location?: string;
  category?: 'HOT' | 'WARM' | 'COLD';
  status?: LeadStatus;
  responded?: boolean;
  documentsSent?: boolean;
  dealClosed?: boolean;
  appointmentCompleted?: boolean;
  timestamp?: Date;
  vehicleOfInterest?: string;
  workStatus?: string;
  downPaymentAmount?: number;
  tradeIn?: string;
  aiAnalysis?: {
    score: number;
    insights: string[];
    intent?: string;
    sentiment?: string;
    buyerStage?: string;
    negotiationStrategy?: string;
    nudgeSent?: boolean;
    requestedConsultation?: boolean;
    preferredType?: string;
    budget?: number;
  };
  behavioralMetrics?: {
    timeOnSite?: number;
    inventoryViews?: number;
    intentTrajectory?: 'improving' | 'stable' | 'declining';
  };
  emailSequence?: {
    welcome1SentAt?: Date;
    welcome2SentAt?: Date;
    welcome3SentAt?: Date;
    welcome4SentAt?: Date;
    reengagement1SentAt?: Date;
    reengagement2SentAt?: Date;
    reengagement3SentAt?: Date;
    postAppointment1SentAt?: Date;
    postAppointment2SentAt?: Date;
    postAppointment3SentAt?: Date;
    emailsSent?: number;
    lastEmailSentAt?: Date;
    lastError?: {
      message: string;
      timestamp: Date;
      emailType: string;
    };
  };
}

export class LeadEntity {
  private constructor(private props: Lead) {}

  /**
   * Factory Method para instanciar la Entidad de forma Segura (con validación de Zod)
   */
  public static create(data: unknown): LeadEntity {
    const parseResult = LeadSchema.safeParse(data);
    if (!parseResult.success) {
      throw new Error(`Error de Integridad LeadEntity (Zod): ${parseResult.error.message}`);
    }
    // Zod lo retorna limpio y tipado, forzamos a Lead ya que Zod es más permisivo con el catchall
    return new LeadEntity(parseResult.data as Lead);
  }

  public get data(): Lead {
    return { ...this.props };
  }

  /**
   * Actualiza el Lead con nueva información re-validándola contra Zod
   */
  public update(newData: Partial<Lead>): LeadEntity {
    const updated = { ...this.props, ...newData };
    return LeadEntity.create(updated);
  }

  /**
   * Determina si el lead tiene un alto potencial basado en ingresos y comportamiento.
   */
  public isHighPotential(): boolean {
    const income = parseInt(this.props.monthlyIncome || '0');
    return income > 3000 || (this.props.viewedInventoryMultipleTimes === true && income > 1500);
  }

  /**
   * Calcula un score de calificación base (lógica de dominio pura).
   */
  public calculateDomainScore(): number {
    let score = 0;
    const income = parseInt(this.props.monthlyIncome || '0');
    if (income > 2500) score += 40;
    else if (income > 1500) score += 20;

    if (this.props.hasPronto) score += 30;
    if (this.props.timeAtJob && !this.props.timeAtJob.includes('mes')) score += 20; // Asumiendo formato "X años"

    return Math.min(score, 100);
  }
}
