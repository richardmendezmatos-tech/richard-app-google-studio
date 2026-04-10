const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'richard-automotive-data-connect',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

const createCarRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateCar', inputVars);
}
createCarRef.operationName = 'CreateCar';
exports.createCarRef = createCarRef;

exports.createCar = function createCar(dcOrVars, vars) {
  return executeMutation(createCarRef(dcOrVars, vars));
};

const createLeadRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateLead', inputVars);
}
createLeadRef.operationName = 'CreateLead';
exports.createLeadRef = createLeadRef;

exports.createLead = function createLead(dcOrVars, vars) {
  return executeMutation(createLeadRef(dcOrVars, vars));
};

const updateLeadStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateLeadStatus', inputVars);
}
updateLeadStatusRef.operationName = 'UpdateLeadStatus';
exports.updateLeadStatusRef = updateLeadStatusRef;

exports.updateLeadStatus = function updateLeadStatus(dcOrVars, vars) {
  return executeMutation(updateLeadStatusRef(dcOrVars, vars));
};

const updateLeadIntelligenceRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateLeadIntelligence', inputVars);
}
updateLeadIntelligenceRef.operationName = 'UpdateLeadIntelligence';
exports.updateLeadIntelligenceRef = updateLeadIntelligenceRef;

exports.updateLeadIntelligence = function updateLeadIntelligence(dcOrVars, vars) {
  return executeMutation(updateLeadIntelligenceRef(dcOrVars, vars));
};

const listCarsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListCars', inputVars);
}
listCarsRef.operationName = 'ListCars';
exports.listCarsRef = listCarsRef;

exports.listCars = function listCars(dcOrVars, vars) {
  return executeQuery(listCarsRef(dcOrVars, vars));
};

const getCarRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetCar', inputVars);
}
getCarRef.operationName = 'GetCar';
exports.getCarRef = getCarRef;

exports.getCar = function getCar(dcOrVars, vars) {
  return executeQuery(getCarRef(dcOrVars, vars));
};

const getLeadRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetLead', inputVars);
}
getLeadRef.operationName = 'GetLead';
exports.getLeadRef = getLeadRef;

exports.getLead = function getLead(dcOrVars, vars) {
  return executeQuery(getLeadRef(dcOrVars, vars));
};

const listLeadsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListLeads', inputVars);
}
listLeadsRef.operationName = 'ListLeads';
exports.listLeadsRef = listLeadsRef;

exports.listLeads = function listLeads(dcOrVars, vars) {
  return executeQuery(listLeadsRef(dcOrVars, vars));
};

const listHighProbabilityLeadsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListHighProbabilityLeads', inputVars);
}
listHighProbabilityLeadsRef.operationName = 'ListHighProbabilityLeads';
exports.listHighProbabilityLeadsRef = listHighProbabilityLeadsRef;

exports.listHighProbabilityLeads = function listHighProbabilityLeads(dcOrVars, vars) {
  return executeQuery(listHighProbabilityLeadsRef(dcOrVars, vars));
};
