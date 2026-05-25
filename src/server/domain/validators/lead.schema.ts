import { z } from 'zod';

// Define el estado posible del Lead basado en LeadStatus
export const LeadStatusSchema = z.enum([
  'new',
  'contacted',
  'qualified',
  'negotiating',
  'sold',
  'lost',
  'pre-approved',
]);

const DateSchema = z
  .union([
    z.date(),
    z.string().transform((v) => new Date(v)),
    z
      .any()
      .transform((v) => (v && typeof v === 'object' && 'toDate' in v ? (v as any).toDate() : v)),
  ])
  .pipe(z.date());

export const LeadSchema = z
  .object({
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
    timestamp: DateSchema.optional(),
    vehicleOfInterest: z.string().optional(),
    workStatus: z.string().optional(),
    downPaymentAmount: z.number().optional(),
    tradeIn: z.string().optional(),
    aiAnalysis: z
      .object({
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
      })
      .optional(),
    behavioralMetrics: z
      .object({
        timeOnSite: z.number().optional(),
        inventoryViews: z.number().optional(),
        intentTrajectory: z.enum(['improving', 'stable', 'declining']).optional(),
      })
      .optional(),
    customer_memory: z
      .object({
        last_seen: z.string().optional(),
        whatsapp_messages: z.number().optional(),
        preferred_contact_method: z.string().optional(),
        search_intent_summary: z.string().optional(),
      })
      .catchall(z.any())
      .optional(),
    emailSequence: z
      .object({
        welcome1SentAt: DateSchema.optional(),
        welcome2SentAt: DateSchema.optional(),
        welcome3SentAt: DateSchema.optional(),
        welcome4SentAt: DateSchema.optional(),
        reengagement1SentAt: DateSchema.optional(),
        reengagement2SentAt: DateSchema.optional(),
        reengagement3SentAt: DateSchema.optional(),
        postAppointment1SentAt: DateSchema.optional(),
        postAppointment2SentAt: DateSchema.optional(),
        postAppointment3SentAt: DateSchema.optional(),
        emailsSent: z.number().optional(),
        lastEmailSentAt: DateSchema.optional(),
        lastError: z
          .object({
            message: z.string(),
            timestamp: DateSchema,
            emailType: z.string(),
          })
          .optional(),
      })
      .optional(),
  })
  .catchall(z.any()); // Allowed to pass legacy properties to avoid crashing

/**
 * Función Middleware Helper para validar Entidades de Firestore seguras
 * @param data Objeto proveniente de la Interface o del Front
 * @returns { success: boolean, data?: Lead, error?: any }
 */
export const validateLeadData = (data: unknown) => {
  return LeadSchema.safeParse(data);
};
