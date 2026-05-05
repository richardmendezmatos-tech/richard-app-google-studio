import { z } from 'zod';

// Define el estado posible del Lead basado en LeadStatus
export const LeadStatusSchema = z.enum([
  'new', 
  'contacted', 
  'qualified', 
  'negotiating', 
  'sold', 
  'lost', 
  'pre-approved'
]);

const FirestoreDateSchema = z.union([
  z.date(),
  z.any().transform(v => (v && typeof v === 'object' && 'toDate' in v ? (v as any).toDate() : v))
]).pipe(z.date());

export const LeadSchema = z.object({
  id: z.string().optional(),
  firstName: z.string().min(1, 'El nombre es obligatorio').trim(),
  lastName: z.string().min(1, 'El apellido es obligatorio').trim(),
  phone: z.string().min(6, 'Teléfono inválido').trim(),
  email: z.string().email('Formato de email incorrecto').trim(),
  monthlyIncome: z.string().optional(),
  timeAtJob: z.string().optional(),
  jobTitle: z.string().optional(),
  employer: z.string().optional(),
  vehicleId: z.string().optional(),
  hasPronto: z.boolean().optional(),
  ssn: z.string().optional(),
  addressLine1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  housingType: z.string().optional(),
  timeAtAddress: z.string().optional(),
  timeAtEmployer: z.string().optional(),
  hasCreditApplication: z.boolean().optional(),
  chatInteractions: z.number().optional(),
  viewedInventoryMultipleTimes: z.boolean().optional(),
  location: z.string().optional(),
  category: z.enum(['HOT', 'WARM', 'COLD']).optional(),
  status: LeadStatusSchema.optional(),
  responded: z.boolean().optional(),
  documentsSent: z.boolean().optional(),
  dealClosed: z.boolean().optional(),
  appointmentCompleted: z.boolean().optional(),
  timestamp: FirestoreDateSchema.optional(),
  vehicleOfInterest: z.string().optional(),
  workStatus: z.string().optional(),
  downPaymentAmount: z.number().optional(),
  tradeIn: z.string().optional(),
  aiAnalysis: z.object({
    score: z.number().min(0).max(100),
    insights: z.array(z.string()),
    intent: z.string().optional(),
    sentiment: z.string().optional(),
    buyerStage: z.string().optional(),
    negotiationStrategy: z.string().optional(),
    nudgeSent: z.boolean().optional(),
    requestedConsultation: z.boolean().optional(),
    preferredType: z.string().optional(),
    budget: z.number().optional(),
  }).optional(),
  behavioralMetrics: z.object({
    timeOnSite: z.number().optional(),
    inventoryViews: z.number().optional(),
    intentTrajectory: z.enum(['improving', 'stable', 'declining']).optional(),
  }).optional(),
  emailSequence: z.object({
    welcome1SentAt: FirestoreDateSchema.optional(),
    welcome2SentAt: FirestoreDateSchema.optional(),
    welcome3SentAt: FirestoreDateSchema.optional(),
    welcome4SentAt: FirestoreDateSchema.optional(),
    reengagement1SentAt: FirestoreDateSchema.optional(),
    reengagement2SentAt: FirestoreDateSchema.optional(),
    reengagement3SentAt: FirestoreDateSchema.optional(),
    postAppointment1SentAt: FirestoreDateSchema.optional(),
    postAppointment2SentAt: FirestoreDateSchema.optional(),
    postAppointment3SentAt: FirestoreDateSchema.optional(),
    emailsSent: z.number().optional(),
    lastEmailSentAt: FirestoreDateSchema.optional(),
    lastError: z.object({
      message: z.string(),
      timestamp: FirestoreDateSchema,
      emailType: z.string(),
    }).optional(),
  }).optional()
}).catchall(z.any()); // Allowed to pass legacy properties to avoid crashing

/**
 * Función Middleware Helper para validar Entidades de Firestore seguras
 * @param data Objeto proveniente de la Interface o del Front
 * @returns { success: boolean, data?: Lead, error?: any }
 */
export const validateLeadData = (data: unknown) => {
  return LeadSchema.safeParse(data);
};
