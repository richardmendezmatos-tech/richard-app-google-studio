import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

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

interface CreateCarRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateCarVariables): MutationRef<CreateCarData, CreateCarVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateCarVariables): MutationRef<CreateCarData, CreateCarVariables>;
  operationName: string;
}
export const createCarRef: CreateCarRef;

export function createCar(vars: CreateCarVariables): MutationPromise<CreateCarData, CreateCarVariables>;
export function createCar(dc: DataConnect, vars: CreateCarVariables): MutationPromise<CreateCarData, CreateCarVariables>;

interface CreateLeadRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateLeadVariables): MutationRef<CreateLeadData, CreateLeadVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateLeadVariables): MutationRef<CreateLeadData, CreateLeadVariables>;
  operationName: string;
}
export const createLeadRef: CreateLeadRef;

export function createLead(vars: CreateLeadVariables): MutationPromise<CreateLeadData, CreateLeadVariables>;
export function createLead(dc: DataConnect, vars: CreateLeadVariables): MutationPromise<CreateLeadData, CreateLeadVariables>;

interface UpdateLeadStatusRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateLeadStatusVariables): MutationRef<UpdateLeadStatusData, UpdateLeadStatusVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateLeadStatusVariables): MutationRef<UpdateLeadStatusData, UpdateLeadStatusVariables>;
  operationName: string;
}
export const updateLeadStatusRef: UpdateLeadStatusRef;

export function updateLeadStatus(vars: UpdateLeadStatusVariables): MutationPromise<UpdateLeadStatusData, UpdateLeadStatusVariables>;
export function updateLeadStatus(dc: DataConnect, vars: UpdateLeadStatusVariables): MutationPromise<UpdateLeadStatusData, UpdateLeadStatusVariables>;

interface UpdateLeadIntelligenceRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateLeadIntelligenceVariables): MutationRef<UpdateLeadIntelligenceData, UpdateLeadIntelligenceVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateLeadIntelligenceVariables): MutationRef<UpdateLeadIntelligenceData, UpdateLeadIntelligenceVariables>;
  operationName: string;
}
export const updateLeadIntelligenceRef: UpdateLeadIntelligenceRef;

export function updateLeadIntelligence(vars: UpdateLeadIntelligenceVariables): MutationPromise<UpdateLeadIntelligenceData, UpdateLeadIntelligenceVariables>;
export function updateLeadIntelligence(dc: DataConnect, vars: UpdateLeadIntelligenceVariables): MutationPromise<UpdateLeadIntelligenceData, UpdateLeadIntelligenceVariables>;

interface ListCarsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: ListCarsVariables): QueryRef<ListCarsData, ListCarsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: ListCarsVariables): QueryRef<ListCarsData, ListCarsVariables>;
  operationName: string;
}
export const listCarsRef: ListCarsRef;

export function listCars(vars?: ListCarsVariables): QueryPromise<ListCarsData, ListCarsVariables>;
export function listCars(dc: DataConnect, vars?: ListCarsVariables): QueryPromise<ListCarsData, ListCarsVariables>;

interface GetCarRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetCarVariables): QueryRef<GetCarData, GetCarVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetCarVariables): QueryRef<GetCarData, GetCarVariables>;
  operationName: string;
}
export const getCarRef: GetCarRef;

export function getCar(vars: GetCarVariables): QueryPromise<GetCarData, GetCarVariables>;
export function getCar(dc: DataConnect, vars: GetCarVariables): QueryPromise<GetCarData, GetCarVariables>;

interface GetLeadRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetLeadVariables): QueryRef<GetLeadData, GetLeadVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetLeadVariables): QueryRef<GetLeadData, GetLeadVariables>;
  operationName: string;
}
export const getLeadRef: GetLeadRef;

export function getLead(vars: GetLeadVariables): QueryPromise<GetLeadData, GetLeadVariables>;
export function getLead(dc: DataConnect, vars: GetLeadVariables): QueryPromise<GetLeadData, GetLeadVariables>;

interface ListLeadsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: ListLeadsVariables): QueryRef<ListLeadsData, ListLeadsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: ListLeadsVariables): QueryRef<ListLeadsData, ListLeadsVariables>;
  operationName: string;
}
export const listLeadsRef: ListLeadsRef;

export function listLeads(vars?: ListLeadsVariables): QueryPromise<ListLeadsData, ListLeadsVariables>;
export function listLeads(dc: DataConnect, vars?: ListLeadsVariables): QueryPromise<ListLeadsData, ListLeadsVariables>;

interface ListHighProbabilityLeadsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: ListHighProbabilityLeadsVariables): QueryRef<ListHighProbabilityLeadsData, ListHighProbabilityLeadsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: ListHighProbabilityLeadsVariables): QueryRef<ListHighProbabilityLeadsData, ListHighProbabilityLeadsVariables>;
  operationName: string;
}
export const listHighProbabilityLeadsRef: ListHighProbabilityLeadsRef;

export function listHighProbabilityLeads(vars?: ListHighProbabilityLeadsVariables): QueryPromise<ListHighProbabilityLeadsData, ListHighProbabilityLeadsVariables>;
export function listHighProbabilityLeads(dc: DataConnect, vars?: ListHighProbabilityLeadsVariables): QueryPromise<ListHighProbabilityLeadsData, ListHighProbabilityLeadsVariables>;

