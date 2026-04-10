import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'richard-automotive-data-connect',
  location: 'us-central1'
};

export const createCarRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateCar', inputVars);
}
createCarRef.operationName = 'CreateCar';

export function createCar(dcOrVars, vars) {
  return executeMutation(createCarRef(dcOrVars, vars));
}

export const createLeadRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateLead', inputVars);
}
createLeadRef.operationName = 'CreateLead';

export function createLead(dcOrVars, vars) {
  return executeMutation(createLeadRef(dcOrVars, vars));
}

export const updateLeadStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateLeadStatus', inputVars);
}
updateLeadStatusRef.operationName = 'UpdateLeadStatus';

export function updateLeadStatus(dcOrVars, vars) {
  return executeMutation(updateLeadStatusRef(dcOrVars, vars));
}

export const updateLeadIntelligenceRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateLeadIntelligence', inputVars);
}
updateLeadIntelligenceRef.operationName = 'UpdateLeadIntelligence';

export function updateLeadIntelligence(dcOrVars, vars) {
  return executeMutation(updateLeadIntelligenceRef(dcOrVars, vars));
}

export const listCarsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListCars', inputVars);
}
listCarsRef.operationName = 'ListCars';

export function listCars(dcOrVars, vars) {
  return executeQuery(listCarsRef(dcOrVars, vars));
}

export const getCarRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetCar', inputVars);
}
getCarRef.operationName = 'GetCar';

export function getCar(dcOrVars, vars) {
  return executeQuery(getCarRef(dcOrVars, vars));
}

export const getLeadRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetLead', inputVars);
}
getLeadRef.operationName = 'GetLead';

export function getLead(dcOrVars, vars) {
  return executeQuery(getLeadRef(dcOrVars, vars));
}

export const listLeadsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListLeads', inputVars);
}
listLeadsRef.operationName = 'ListLeads';

export function listLeads(dcOrVars, vars) {
  return executeQuery(listLeadsRef(dcOrVars, vars));
}

export const listHighProbabilityLeadsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListHighProbabilityLeads', inputVars);
}
listHighProbabilityLeadsRef.operationName = 'ListHighProbabilityLeads';

export function listHighProbabilityLeads(dcOrVars, vars) {
  return executeQuery(listHighProbabilityLeadsRef(dcOrVars, vars));
}

