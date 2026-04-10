import { CreateCarData, CreateCarVariables, CreateLeadData, CreateLeadVariables, UpdateLeadStatusData, UpdateLeadStatusVariables, UpdateLeadIntelligenceData, UpdateLeadIntelligenceVariables, ListCarsData, ListCarsVariables, GetCarData, GetCarVariables, GetLeadData, GetLeadVariables, ListLeadsData, ListLeadsVariables, ListHighProbabilityLeadsData, ListHighProbabilityLeadsVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateCar(options?: useDataConnectMutationOptions<CreateCarData, FirebaseError, CreateCarVariables>): UseDataConnectMutationResult<CreateCarData, CreateCarVariables>;
export function useCreateCar(dc: DataConnect, options?: useDataConnectMutationOptions<CreateCarData, FirebaseError, CreateCarVariables>): UseDataConnectMutationResult<CreateCarData, CreateCarVariables>;

export function useCreateLead(options?: useDataConnectMutationOptions<CreateLeadData, FirebaseError, CreateLeadVariables>): UseDataConnectMutationResult<CreateLeadData, CreateLeadVariables>;
export function useCreateLead(dc: DataConnect, options?: useDataConnectMutationOptions<CreateLeadData, FirebaseError, CreateLeadVariables>): UseDataConnectMutationResult<CreateLeadData, CreateLeadVariables>;

export function useUpdateLeadStatus(options?: useDataConnectMutationOptions<UpdateLeadStatusData, FirebaseError, UpdateLeadStatusVariables>): UseDataConnectMutationResult<UpdateLeadStatusData, UpdateLeadStatusVariables>;
export function useUpdateLeadStatus(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateLeadStatusData, FirebaseError, UpdateLeadStatusVariables>): UseDataConnectMutationResult<UpdateLeadStatusData, UpdateLeadStatusVariables>;

export function useUpdateLeadIntelligence(options?: useDataConnectMutationOptions<UpdateLeadIntelligenceData, FirebaseError, UpdateLeadIntelligenceVariables>): UseDataConnectMutationResult<UpdateLeadIntelligenceData, UpdateLeadIntelligenceVariables>;
export function useUpdateLeadIntelligence(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateLeadIntelligenceData, FirebaseError, UpdateLeadIntelligenceVariables>): UseDataConnectMutationResult<UpdateLeadIntelligenceData, UpdateLeadIntelligenceVariables>;

export function useListCars(vars?: ListCarsVariables, options?: useDataConnectQueryOptions<ListCarsData>): UseDataConnectQueryResult<ListCarsData, ListCarsVariables>;
export function useListCars(dc: DataConnect, vars?: ListCarsVariables, options?: useDataConnectQueryOptions<ListCarsData>): UseDataConnectQueryResult<ListCarsData, ListCarsVariables>;

export function useGetCar(vars: GetCarVariables, options?: useDataConnectQueryOptions<GetCarData>): UseDataConnectQueryResult<GetCarData, GetCarVariables>;
export function useGetCar(dc: DataConnect, vars: GetCarVariables, options?: useDataConnectQueryOptions<GetCarData>): UseDataConnectQueryResult<GetCarData, GetCarVariables>;

export function useGetLead(vars: GetLeadVariables, options?: useDataConnectQueryOptions<GetLeadData>): UseDataConnectQueryResult<GetLeadData, GetLeadVariables>;
export function useGetLead(dc: DataConnect, vars: GetLeadVariables, options?: useDataConnectQueryOptions<GetLeadData>): UseDataConnectQueryResult<GetLeadData, GetLeadVariables>;

export function useListLeads(vars?: ListLeadsVariables, options?: useDataConnectQueryOptions<ListLeadsData>): UseDataConnectQueryResult<ListLeadsData, ListLeadsVariables>;
export function useListLeads(dc: DataConnect, vars?: ListLeadsVariables, options?: useDataConnectQueryOptions<ListLeadsData>): UseDataConnectQueryResult<ListLeadsData, ListLeadsVariables>;

export function useListHighProbabilityLeads(vars?: ListHighProbabilityLeadsVariables, options?: useDataConnectQueryOptions<ListHighProbabilityLeadsData>): UseDataConnectQueryResult<ListHighProbabilityLeadsData, ListHighProbabilityLeadsVariables>;
export function useListHighProbabilityLeads(dc: DataConnect, vars?: ListHighProbabilityLeadsVariables, options?: useDataConnectQueryOptions<ListHighProbabilityLeadsData>): UseDataConnectQueryResult<ListHighProbabilityLeadsData, ListHighProbabilityLeadsVariables>;
