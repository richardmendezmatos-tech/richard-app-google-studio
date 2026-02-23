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

    // Use Cases
    private getLeadsUseCase = new GetLeads(this.leadRepository);
    private getInventoryUseCase = new GetInventory(this.inventoryRepository);
    private getHoustonTelemetryUseCase = new GetHoustonTelemetry(this.houstonRepository);

    private constructor() { }

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
}

export const container = DIContainer.getInstance();
