import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import * as logger from 'firebase-functions/logger';
import { InventoryMatchingService } from '../services/inventoryMatchingService';
import { FirestoreLeadRepository } from '../infrastructure/persistence/firestore/FirestoreLeadRepository';
import { SendGridEmailRepository } from '../infrastructure/messaging/SendGridEmailRepository';
import { TwilioSMSRepository } from '../infrastructure/messaging/TwilioSMSRepository';
import { MetaCapiRepository } from '../infrastructure/marketing/MetaCapiRepository';
import { TwilioWhatsAppRepository } from '../infrastructure/messaging/TwilioWhatsAppRepository';
import { ProcessNewLeadApplication } from '../application/use-cases';
import { NotifyPriceDrop, NotifyLeadStatusChange, ScoreCalculator } from '../application/use-cases';
import { Lead } from '../domain/entities';

// Infrastructure Instantiation (Localized for triggers)
const leadRepository = new FirestoreLeadRepository();
const emailRepository = new SendGridEmailRepository();
const smsRepository = new TwilioSMSRepository();
const metaRepository = new MetaCapiRepository();
const whatsAppRepository = new TwilioWhatsAppRepository();

// Use Cases
const leadAppProcessor = new ProcessNewLeadApplication(
  leadRepository,
  emailRepository,
  smsRepository,
  metaRepository,
  whatsAppRepository,
);

// --- Inventory Semantic Indexing ---

export const onCarCreated = onDocumentCreated('cars/{carId}', async (event) => {
  const data = event.data?.data();
  if (!data) return;

  logger.info(`Indexing new car [CLEAN]: ${event.params.carId}`);
  try {
    const { updateCarEmbedding } = await import('../infrastructure/ai/VectorAdapter');
    await updateCarEmbedding(event.params.carId, data);

    // Proactive Matching Motor (Richard Automotive Command Center)
    await InventoryMatchingService.matchInventoryToLeads(event.params.carId, data);
  } catch (e) {
    logger.error(`Error indexing car ${event.params.carId}:`, e);
  }
});

export const onCarUpdated = onDocumentUpdated('cars/{carId}', async (event) => {
  const before = event.data?.before.data();
  const after = event.data?.after.data();
  if (!before || !after) return;

  const coreFieldsChanged =
    before.name !== after.name ||
    before.type !== after.type ||
    before.description !== after.description ||
    JSON.stringify(before.features) !== JSON.stringify(after.features);

  if (coreFieldsChanged) {
    logger.info(`Re-indexing car due to changes: ${event.params.carId}`);
    try {
      const { updateCarEmbedding } = await import('../infrastructure/ai/VectorAdapter');
      await updateCarEmbedding(event.params.carId, after);
    } catch (e) {
      logger.error(`Error re-indexing car ${event.params.carId}:`, e);
    }
  }
});

export const onNewApplication = onDocumentCreated(
  {
    document: 'applications/{applicationId}',
    secrets: [
      'SENDGRID_API_KEY',
      'TWILIO_ACCOUNT_SID',
      'TWILIO_AUTH_TOKEN',
      'TWILIO_PHONE_NUMBER',
      'VITE_META_PIXEL_ID',
      'META_ACCESS_TOKEN',
    ],
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const data = snapshot.data() as Lead;
    const appId = event.params.applicationId;

    logger.info(`[NIVEL 12] Processing New Lead: ${appId}`, { email: data.email });

    try {
      await leadAppProcessor.execute({
        id: appId,
        data: data,
      });
      logger.info(`[NIVEL 12] Lead ${appId} processed successfully via Use Case.`);
    } catch (err) {
      logger.error(`[NIVEL 12] Error processing lead ${appId}`, err);
    }
  },
);

export const onVehicleUpdate = onDocumentUpdated(
  {
    document: 'cars/{carId}',
    secrets: ['SENDGRID_API_KEY'],
  },
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();

    if (!before || !after) return;

    // Check for Price Drop
    if (after.price < before.price) {
      try {
        const useCase = new NotifyPriceDrop(leadRepository, emailRepository);
        await useCase.execute(
          event.params.carId,
          Number(before.price),
          Number(after.price),
          after.name || after.model,
        );
        logger.info(`Price Drop Alert executed for ${event.params.carId}`);
      } catch (error) {
        logger.error(`Error in onVehicleUpdate price drop alert`, error);
      }
    }
  },
);

export const onLeadStatusChange = onDocumentUpdated(
  {
    document: 'applications/{leadId}',
    secrets: ['SENDGRID_API_KEY'],
  },
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();

    if (!before || !after) return;

    // Only react if status CHANGED
    if (before.status === after.status) return;

    try {
      const useCase = new NotifyLeadStatusChange(emailRepository);
      await useCase.execute(after as Lead, before.status, after.status);
      logger.info(`Lead Status Change notification executed for ${event.params.leadId}`);
    } catch (error) {
      logger.error(`Error in onLeadStatusChange`, error);
    }
  },
);

export const onLeadMetricsUpdate = onDocumentUpdated('applications/{leadId}', async (event) => {
  const before = event.data?.before.data() as Lead;
  const after = event.data?.after.data() as Lead;
  if (!before || !after) return;

  const metricsChanged =
    before.behavioralMetrics?.inventoryViews !== after.behavioralMetrics?.inventoryViews ||
    before.behavioralMetrics?.timeOnSite !== after.behavioralMetrics?.timeOnSite ||
    before.chatInteractions !== after.chatInteractions ||
    before.monthlyIncome !== after.monthlyIncome ||
    before.hasPronto !== after.hasPronto;

  if (metricsChanged) {
    logger.info(`Recalculating score for lead ${event.params.leadId} due to metrics update.`);
    const scoreResult = ScoreCalculator.execute(after);

    await event.data?.after.ref.update({
      'aiAnalysis.score': scoreResult.score,
      category: scoreResult.category,
      'aiAnalysis.insights': scoreResult.insights,
    });
  }
});
