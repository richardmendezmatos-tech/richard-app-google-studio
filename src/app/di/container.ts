import { GetLeads } from '@/features/shared';
import { GetInventory } from '@/features/shared';
import { GetHoustonTelemetry } from '@/features/shared';
import { FirestoreLeadRepository, FirestorePredictiveRepository } from '@/entities/lead';
import { FirestoreInventoryRepository } from '@/entities/inventory';
import { FirestoreHoustonRepository } from '@/entities/houston';
import { FirestoreUserRepository } from '@/entities/user';
import { FirestoreApplicationRepository } from '@/shared/api/repositories/FirestoreApplicationRepository';
import { FirestoreStorageRepository } from '@/shared/api/repositories/FirestoreStorageRepository';
import { FirestoreSubscriberRepository } from '@/shared/api/repositories/FirestoreSubscriberRepository';
import { FirestoreSurveyRepository } from '@/shared/api/repositories/FirestoreSurveyRepository';
import { IdentifyOutreachOpportunities } from '@/features/shared';
import { CalculateDynamicMargin } from '@/features/shared';
import { EvaluarAprobacionVenta } from '@/features/loans';
import { FirestoreLoanRepository } from '@/features/loans';

class DIContainer {
  private static instance: DIContainer;

  // Repositories (Lazy Loaded)
  private _repos = {
    lead: new FirestoreLeadRepository(),
    inventory: new FirestoreInventoryRepository(),
    application: new FirestoreApplicationRepository(),
    storage: new FirestoreStorageRepository(),
    user: new FirestoreUserRepository(),
    subscriber: new FirestoreSubscriberRepository(),
    survey: new FirestoreSurveyRepository(),
    houston: new FirestoreHoustonRepository(),
    predictive: new FirestorePredictiveRepository(),
    loan: new FirestoreLoanRepository(),
  };

  // Use Cases (Lazy Loaded)
  private _useCases = {
    leads: new GetLeads(this._repos.lead),
    inventory: new GetInventory(this._repos.inventory),
    houstonTelemetry: new GetHoustonTelemetry(this._repos.houston),
    identifyOutreachOpportunities: new IdentifyOutreachOpportunities(
      this._repos.predictive,
      this._repos.lead,
    ),
    calculateDynamicMargin: new CalculateDynamicMargin(),
    evaluarAprobacionVenta: new EvaluarAprobacionVenta(this._repos.loan),
  };

  private constructor() {}

  public static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  // Getters (Clean API)
  public getLeadsUseCase() { return this._useCases.leads; }
  public getInventoryUseCase() { return this._useCases.inventory; }
  public getHoustonTelemetryUseCase() { return this._useCases.houstonTelemetry; }
  public getIdentifyOutreachOpportunitiesUseCase() { return this._useCases.identifyOutreachOpportunities; }
  public getCalculateDynamicMarginUseCase() { return this._useCases.calculateDynamicMargin; }
  public getEvaluarAprobacionVentaUseCase() { return this._useCases.evaluarAprobacionVenta; }

  public getLeadRepository() { return this._repos.lead; }
  public getApplicationRepository() { return this._repos.application; }
  public getStorageRepository() { return this._repos.storage; }
  public getUserRepository() { return this._repos.user; }
  public getSubscriberRepository() { return this._repos.subscriber; }
  public getSurveyRepository() { return this._repos.survey; }
  public getPredictiveRepository() { return this._repos.predictive; }
}

import { DI } from '@/app/di/registry';
import { sendWhatsAppMessage } from '@/features/leads';
import { getAntigravityOutreachAction } from '@/features/omnichannel';

export const container = DIContainer.getInstance();

// Hydrate static registry for FSD compliance
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
