import { GetLeads } from '../../application/use-cases/GetLeads';
import { GetInventory } from '../../application/use-cases/GetInventory';
import { GetHoustonTelemetry } from '../../application/use-cases/GetHoustonTelemetry';
import { FirestoreLeadRepository } from '../repositories/FirestoreLeadRepository';
import { FirestoreInventoryRepository } from '../repositories/FirestoreInventoryRepository';
import { FirestoreHoustonRepository } from '../repositories/FirestoreHoustonRepository';
import { FirestoreApplicationRepository } from '../repositories/FirestoreApplicationRepository';
import { FirestoreStorageRepository } from '../repositories/FirestoreStorageRepository';
import { FirestoreUserRepository } from '../repositories/FirestoreUserRepository';
import { FirestoreSubscriberRepository } from '../repositories/FirestoreSubscriberRepository';
import { FirestoreSurveyRepository } from '../repositories/FirestoreSurveyRepository';
import { IdentifyOutreachOpportunities } from '../../application/use-cases/IdentifyOutreachOpportunities';
import { CalculateDynamicMargin } from '../../application/use-cases/CalculateDynamicMargin';
import { FirestorePredictiveRepository } from '../repositories/FirestorePredictiveRepository';
import { EvaluarAprobacionVenta } from '../../features/loans/application/EvaluarAprobacionVenta';
import { FirestoreLoanRepository } from '../../features/loans/infra/FirestoreLoanRepository';

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
  private getLeadsUseCase = new GetLeads(this.leadRepository);
  private getInventoryUseCase = new GetInventory(this.inventoryRepository);
  private getHoustonTelemetryUseCase = new GetHoustonTelemetry(this.houstonRepository);
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

  public getGetLeadsUseCase(): GetLeads {
    return this.getLeadsUseCase;
  }

  public getGetInventoryUseCase(): GetInventory {
    return this.getInventoryUseCase;
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

  public getGetHoustonTelemetryUseCase(): GetHoustonTelemetry {
    return this.getHoustonTelemetryUseCase;
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

export const container = DIContainer.getInstance();
