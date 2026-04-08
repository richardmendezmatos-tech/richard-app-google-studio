import { ApplicationData, SubscriberData, SurveyData } from '../model/captureTypes';

export interface ApplicationRepository {
  submitApplication(data: ApplicationData, dealerId: string): Promise<string>;
  getApplicationById(id: string): Promise<ApplicationData | null>;
}

export interface SubscriberRepository {
  subscribe(data: SubscriberData): Promise<void>;
  getSubscribers(): Promise<SubscriberData[]>;
}

export interface SurveyRepository {
  submitSurvey(data: SurveyData): Promise<void>;
}
