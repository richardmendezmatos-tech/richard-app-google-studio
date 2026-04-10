import { ConnectorConfig, DataConnect, OperationOptions, ExecuteOperationResponse } from 'firebase-admin/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;


export interface Car_Key {
  id: UUIDString;
  __typename?: 'Car_Key';
}

export interface CreateCarData {
  car_insert: Car_Key;
}

export interface CreateCarVariables {
  year: number;
  make: string;
  model: string;
  name: string;
  price: number;
  mileage: number;
  type: string;
  category: string;
  condition: string;
  img?: string | null;
  dealerId?: string | null;
  featured?: boolean | null;
  views?: number | null;
  leadsCount?: number | null;
}

export interface CreateLeadData {
  lead_insert: Lead_Key;
}

export interface CreateLeadVariables {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  vehicleOfInterest?: string | null;
  vehicleId?: UUIDString | null;
  type?: string | null;
  behavioralData?: string | null;
  aiAnalysis?: string | null;
  marketingData?: string | null;
  closureProbability?: number | null;
  totalVisits?: number | null;
}

export interface GetCarData {
  car?: {
    id: UUIDString;
    make: string;
    model: string;
    year: number;
    price: number;
    mileage: number;
    img?: string | null;
    images?: string[] | null;
    type: string;
    condition: string;
    description?: string | null;
    features?: string[] | null;
    status?: string | null;
    views?: number | null;
    leadsCount?: number | null;
    dealerId?: string | null;
    updatedAt: DateString;
  } & Car_Key;
}

export interface GetCarVariables {
  id: UUIDString;
}

export interface GetLeadData {
  lead?: {
    id: UUIDString;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    status?: string | null;
    category?: string | null;
    type?: string | null;
    behavioralData?: string | null;
    aiAnalysis?: string | null;
    marketingData?: string | null;
    closureProbability?: number | null;
    totalVisits?: number | null;
    timestamp: DateString;
    vehicleOfInterest?: string | null;
    vehicleId?: UUIDString | null;
    hasPronto?: boolean | null;
    chatInteractions?: number | null;
    responded?: boolean | null;
    documentsSent?: boolean | null;
    dealClosed?: boolean | null;
    appointmentCompleted?: boolean | null;
  } & Lead_Key;
}

export interface GetLeadVariables {
  id: UUIDString;
}

export interface Lead_Key {
  id: UUIDString;
  __typename?: 'Lead_Key';
}

export interface ListCarsData {
  cars: ({
    id: UUIDString;
    make: string;
    model: string;
    year: number;
    price: number;
    img?: string | null;
    type: string;
    status?: string | null;
    category: string;
    featured?: boolean | null;
    views?: number | null;
    leadsCount?: number | null;
  } & Car_Key)[];
}

export interface ListCarsVariables {
  limit?: number | null;
  offset?: number | null;
  dealerId?: string | null;
}

export interface ListHighProbabilityLeadsData {
  leads: ({
    id: UUIDString;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    vehicleOfInterest?: string | null;
    aiAnalysis?: string | null;
    closureProbability?: number | null;
    timestamp: DateString;
  } & Lead_Key)[];
}

export interface ListHighProbabilityLeadsVariables {
  dealerId?: string | null;
  threshold?: number | null;
  limit?: number | null;
}

export interface ListLeadsData {
  leads: ({
    id: UUIDString;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    status?: string | null;
    category?: string | null;
    type?: string | null;
    closureProbability?: number | null;
    timestamp: DateString;
    vehicleOfInterest?: string | null;
  } & Lead_Key)[];
}

export interface ListLeadsVariables {
  dealerId?: string | null;
  limit?: number | null;
  offset?: number | null;
}

export interface UpdateLeadIntelligenceData {
  lead_update?: Lead_Key | null;
}

export interface UpdateLeadIntelligenceVariables {
  id: UUIDString;
  aiAnalysis?: string | null;
  closureProbability?: number | null;
  behavioralData?: string | null;
  marketingData?: string | null;
}

export interface UpdateLeadStatusData {
  lead_update?: Lead_Key | null;
}

export interface UpdateLeadStatusVariables {
  id: UUIDString;
  status: string;
}

export interface User_Key {
  id: string;
  __typename?: 'User_Key';
}

/** Generated Node Admin SDK operation action function for the 'CreateCar' Mutation. Allow users to execute without passing in DataConnect. */
export function createCar(dc: DataConnect, vars: CreateCarVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateCarData>>;
/** Generated Node Admin SDK operation action function for the 'CreateCar' Mutation. Allow users to pass in custom DataConnect instances. */
export function createCar(vars: CreateCarVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateCarData>>;

/** Generated Node Admin SDK operation action function for the 'CreateLead' Mutation. Allow users to execute without passing in DataConnect. */
export function createLead(dc: DataConnect, vars: CreateLeadVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateLeadData>>;
/** Generated Node Admin SDK operation action function for the 'CreateLead' Mutation. Allow users to pass in custom DataConnect instances. */
export function createLead(vars: CreateLeadVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateLeadData>>;

/** Generated Node Admin SDK operation action function for the 'UpdateLeadStatus' Mutation. Allow users to execute without passing in DataConnect. */
export function updateLeadStatus(dc: DataConnect, vars: UpdateLeadStatusVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateLeadStatusData>>;
/** Generated Node Admin SDK operation action function for the 'UpdateLeadStatus' Mutation. Allow users to pass in custom DataConnect instances. */
export function updateLeadStatus(vars: UpdateLeadStatusVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateLeadStatusData>>;

/** Generated Node Admin SDK operation action function for the 'UpdateLeadIntelligence' Mutation. Allow users to execute without passing in DataConnect. */
export function updateLeadIntelligence(dc: DataConnect, vars: UpdateLeadIntelligenceVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateLeadIntelligenceData>>;
/** Generated Node Admin SDK operation action function for the 'UpdateLeadIntelligence' Mutation. Allow users to pass in custom DataConnect instances. */
export function updateLeadIntelligence(vars: UpdateLeadIntelligenceVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateLeadIntelligenceData>>;

/** Generated Node Admin SDK operation action function for the 'ListCars' Query. Allow users to execute without passing in DataConnect. */
export function listCars(dc: DataConnect, vars?: ListCarsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListCarsData>>;
/** Generated Node Admin SDK operation action function for the 'ListCars' Query. Allow users to pass in custom DataConnect instances. */
export function listCars(vars?: ListCarsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListCarsData>>;

/** Generated Node Admin SDK operation action function for the 'GetCar' Query. Allow users to execute without passing in DataConnect. */
export function getCar(dc: DataConnect, vars: GetCarVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetCarData>>;
/** Generated Node Admin SDK operation action function for the 'GetCar' Query. Allow users to pass in custom DataConnect instances. */
export function getCar(vars: GetCarVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetCarData>>;

/** Generated Node Admin SDK operation action function for the 'GetLead' Query. Allow users to execute without passing in DataConnect. */
export function getLead(dc: DataConnect, vars: GetLeadVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetLeadData>>;
/** Generated Node Admin SDK operation action function for the 'GetLead' Query. Allow users to pass in custom DataConnect instances. */
export function getLead(vars: GetLeadVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetLeadData>>;

/** Generated Node Admin SDK operation action function for the 'ListLeads' Query. Allow users to execute without passing in DataConnect. */
export function listLeads(dc: DataConnect, vars?: ListLeadsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListLeadsData>>;
/** Generated Node Admin SDK operation action function for the 'ListLeads' Query. Allow users to pass in custom DataConnect instances. */
export function listLeads(vars?: ListLeadsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListLeadsData>>;

/** Generated Node Admin SDK operation action function for the 'ListHighProbabilityLeads' Query. Allow users to execute without passing in DataConnect. */
export function listHighProbabilityLeads(dc: DataConnect, vars?: ListHighProbabilityLeadsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListHighProbabilityLeadsData>>;
/** Generated Node Admin SDK operation action function for the 'ListHighProbabilityLeads' Query. Allow users to pass in custom DataConnect instances. */
export function listHighProbabilityLeads(vars?: ListHighProbabilityLeadsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListHighProbabilityLeadsData>>;

