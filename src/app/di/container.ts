import { GetLeads } from '@/features/shared';
import { GetInventory } from '@/features/shared';
import { GetHoustonTelemetry } from '@/features/shared';
import { FirestoreLeadRepository } from '@/entities/lead';
import { FirestoreInventoryRepository } from '@/entities/lead/api/repositories/FirestoreInventoryRepository';
import { FirestoreHoustonRepository } from '@/entities/lead';
import { FirestoreApplicationRepository } from '@/shared/api/repositories/FirestoreApplicationRepository';
import { FirestoreStorageRepository } from '@/shared/api/repositories/FirestoreStorageRepository';
import { FirestoreUserRepository } from '@/entities/lead';
import { FirestoreSubscriberRepository } from '@/shared/api/repositories/FirestoreSubscriberRepository';
import { FirestoreSurveyRepository } from '@/shared/api/repositories/FirestoreSurveyRepository';
import { IdentifyOutreachOpportunities } from '@/features/shared';
import { CalculateDynamicMargin } from '@/features/shared';
import { FirestorePredictiveRepository } from '@/entities/lead';
import { EvaluarAprobacionVenta } from '@/features/loans';
import { FirestoreLoanRepository } from '@/features/loans';

class DIContainer {
  private static instance: DIContainer;

  // Repositories
  private leadRepository = new FirestoreLeadRepository();
  private inventoryRepository = new FirestoreInventoryRepository();
  private applicationRepository = new FirestoreApplicationRepository();
  private storageRepository = new FirestoreStorageRepository();
  private userRepository = new FirestoreUserRepository();
  private subscriberRepository = new FirestoreSubscriberRepository();
  private surveyRepository = new FirestoreSurveyRepository();
  private houstonRepository = new FirestoreHoustonRepository();
  private predictiveRepository = new FirestorePredictiveRepository();
  private loanRepository = new FirestoreLoanRepository();

  // Services

  // Use Cases
  private leadsUseCase = new GetLeads(this.leadRepository);
  private inventoryUseCase = new GetInventory(this.inventoryRepository);
  private houstonTelemetryUseCase = new GetHoustonTelemetry(this.houstonRepository);
  private identifyOutreachOpportunitiesUseCase = new IdentifyOutreachOpportunities(
    this.predictiveRepository,
    this.leadRepository,
  );
  private calculateDynamicMarginUseCase = new CalculateDynamicMargin();
  private evaluarAprobacionVentaUseCase = new EvaluarAprobacionVenta(this.loanRepository);

  private constructor() {}

  public static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  public getLeadsUseCase(): GetLeads {
    return this.leadsUseCase;
  }

  public getInventoryUseCase(): GetInventory {
    return this.inventoryUseCase;
  }

  public getLeadRepository() {
    return this.leadRepository;
  }

  public getApplicationRepository() {
    return this.applicationRepository;
  }

  public getStorageRepository() {
    return this.storageRepository;
  }

  public getUserRepository() {
    return this.userRepository;
  }

  public getSubscriberRepository() {
    return this.subscriberRepository;
  }

  public getSurveyRepository() {
    return this.surveyRepository;
  }

  public getHoustonTelemetryUseCase(): GetHoustonTelemetry {
    return this.houstonTelemetryUseCase;
  }

  public getIdentifyOutreachOpportunitiesUseCase(): IdentifyOutreachOpportunities {
    return this.identifyOutreachOpportunitiesUseCase;
  }

  public getCalculateDynamicMarginUseCase(): CalculateDynamicMargin {
    return this.calculateDynamicMarginUseCase;
  }

  public getPredictiveRepository() {
    return this.predictiveRepository;
  }

  public getEvaluarAprobacionVentaUseCase(): EvaluarAprobacionVenta {
    return this.evaluarAprobacionVentaUseCase;
  }
}

import { DI } from '@/app/di/registry';
import { sendWhatsAppMessage } from '@/features/leads';
import { getAntigravityOutreachAction } from '@/features/omnichannel';

export const container = DIContainer.getInstance();

// Hydrate static registry for FSD compliance
// Note: Manual assignment since class methods are not enumerable in Object.assign
DI.getLeadsUseCase = container.getLeadsUseCase.bind(container);
DI.getInventoryUseCase = container.getInventoryUseCase.bind(container);
DI.getLeadRepository = container.getLeadRepository.bind(container);
DI.getApplicationRepository = container.getApplicationRepository.bind(container);
DI.getStorageRepository = container.getStorageRepository.bind(container);
DI.getUserRepository = container.getUserRepository.bind(container);
DI.getSubscriberRepository = container.getSubscriberRepository.bind(container);
DI.getSurveyRepository = container.getSurveyRepository.bind(container);
DI.getHoustonTelemetryUseCase = container.getHoustonTelemetryUseCase.bind(container);
DI.getIdentifyOutreachOpportunitiesUseCase =
  container.getIdentifyOutreachOpportunitiesUseCase.bind(container);
DI.getCalculateDynamicMarginUseCase = container.getCalculateDynamicMarginUseCase.bind(container);
DI.getPredictiveRepository = container.getPredictiveRepository.bind(container);
DI.getEvaluarAprobacionVentaUseCase = container.getEvaluarAprobacionVentaUseCase.bind(container);
DI.sendWhatsAppMessage = sendWhatsAppMessage;
DI.getAntigravityOutreachAction = getAntigravityOutreachAction;
