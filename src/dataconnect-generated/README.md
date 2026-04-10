# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListCars*](#listcars)
  - [*GetCar*](#getcar)
  - [*GetLead*](#getlead)
  - [*ListLeads*](#listleads)
  - [*ListHighProbabilityLeads*](#listhighprobabilityleads)
- [**Mutations**](#mutations)
  - [*CreateCar*](#createcar)
  - [*CreateLead*](#createlead)
  - [*UpdateLeadStatus*](#updateleadstatus)
  - [*UpdateLeadIntelligence*](#updateleadintelligence)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListCars
You can execute the `ListCars` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listCars(vars?: ListCarsVariables): QueryPromise<ListCarsData, ListCarsVariables>;

interface ListCarsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: ListCarsVariables): QueryRef<ListCarsData, ListCarsVariables>;
}
export const listCarsRef: ListCarsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listCars(dc: DataConnect, vars?: ListCarsVariables): QueryPromise<ListCarsData, ListCarsVariables>;

interface ListCarsRef {
  ...
  (dc: DataConnect, vars?: ListCarsVariables): QueryRef<ListCarsData, ListCarsVariables>;
}
export const listCarsRef: ListCarsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listCarsRef:
```typescript
const name = listCarsRef.operationName;
console.log(name);
```

### Variables
The `ListCars` query has an optional argument of type `ListCarsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListCarsVariables {
  limit?: number | null;
  offset?: number | null;
  dealerId?: string | null;
}
```
### Return Type
Recall that executing the `ListCars` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListCarsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListCars`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listCars, ListCarsVariables } from '@dataconnect/generated';

// The `ListCars` query has an optional argument of type `ListCarsVariables`:
const listCarsVars: ListCarsVariables = {
  limit: ..., // optional
  offset: ..., // optional
  dealerId: ..., // optional
};

// Call the `listCars()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listCars(listCarsVars);
// Variables can be defined inline as well.
const { data } = await listCars({ limit: ..., offset: ..., dealerId: ..., });
// Since all variables are optional for this query, you can omit the `ListCarsVariables` argument.
const { data } = await listCars();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listCars(dataConnect, listCarsVars);

console.log(data.cars);

// Or, you can use the `Promise` API.
listCars(listCarsVars).then((response) => {
  const data = response.data;
  console.log(data.cars);
});
```

### Using `ListCars`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listCarsRef, ListCarsVariables } from '@dataconnect/generated';

// The `ListCars` query has an optional argument of type `ListCarsVariables`:
const listCarsVars: ListCarsVariables = {
  limit: ..., // optional
  offset: ..., // optional
  dealerId: ..., // optional
};

// Call the `listCarsRef()` function to get a reference to the query.
const ref = listCarsRef(listCarsVars);
// Variables can be defined inline as well.
const ref = listCarsRef({ limit: ..., offset: ..., dealerId: ..., });
// Since all variables are optional for this query, you can omit the `ListCarsVariables` argument.
const ref = listCarsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listCarsRef(dataConnect, listCarsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.cars);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.cars);
});
```

## GetCar
You can execute the `GetCar` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getCar(vars: GetCarVariables): QueryPromise<GetCarData, GetCarVariables>;

interface GetCarRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetCarVariables): QueryRef<GetCarData, GetCarVariables>;
}
export const getCarRef: GetCarRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getCar(dc: DataConnect, vars: GetCarVariables): QueryPromise<GetCarData, GetCarVariables>;

interface GetCarRef {
  ...
  (dc: DataConnect, vars: GetCarVariables): QueryRef<GetCarData, GetCarVariables>;
}
export const getCarRef: GetCarRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getCarRef:
```typescript
const name = getCarRef.operationName;
console.log(name);
```

### Variables
The `GetCar` query requires an argument of type `GetCarVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetCarVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetCar` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetCarData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetCar`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getCar, GetCarVariables } from '@dataconnect/generated';

// The `GetCar` query requires an argument of type `GetCarVariables`:
const getCarVars: GetCarVariables = {
  id: ..., 
};

// Call the `getCar()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getCar(getCarVars);
// Variables can be defined inline as well.
const { data } = await getCar({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getCar(dataConnect, getCarVars);

console.log(data.car);

// Or, you can use the `Promise` API.
getCar(getCarVars).then((response) => {
  const data = response.data;
  console.log(data.car);
});
```

### Using `GetCar`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getCarRef, GetCarVariables } from '@dataconnect/generated';

// The `GetCar` query requires an argument of type `GetCarVariables`:
const getCarVars: GetCarVariables = {
  id: ..., 
};

// Call the `getCarRef()` function to get a reference to the query.
const ref = getCarRef(getCarVars);
// Variables can be defined inline as well.
const ref = getCarRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getCarRef(dataConnect, getCarVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.car);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.car);
});
```

## GetLead
You can execute the `GetLead` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getLead(vars: GetLeadVariables): QueryPromise<GetLeadData, GetLeadVariables>;

interface GetLeadRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetLeadVariables): QueryRef<GetLeadData, GetLeadVariables>;
}
export const getLeadRef: GetLeadRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getLead(dc: DataConnect, vars: GetLeadVariables): QueryPromise<GetLeadData, GetLeadVariables>;

interface GetLeadRef {
  ...
  (dc: DataConnect, vars: GetLeadVariables): QueryRef<GetLeadData, GetLeadVariables>;
}
export const getLeadRef: GetLeadRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getLeadRef:
```typescript
const name = getLeadRef.operationName;
console.log(name);
```

### Variables
The `GetLead` query requires an argument of type `GetLeadVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetLeadVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetLead` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetLeadData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetLead`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getLead, GetLeadVariables } from '@dataconnect/generated';

// The `GetLead` query requires an argument of type `GetLeadVariables`:
const getLeadVars: GetLeadVariables = {
  id: ..., 
};

// Call the `getLead()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getLead(getLeadVars);
// Variables can be defined inline as well.
const { data } = await getLead({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getLead(dataConnect, getLeadVars);

console.log(data.lead);

// Or, you can use the `Promise` API.
getLead(getLeadVars).then((response) => {
  const data = response.data;
  console.log(data.lead);
});
```

### Using `GetLead`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getLeadRef, GetLeadVariables } from '@dataconnect/generated';

// The `GetLead` query requires an argument of type `GetLeadVariables`:
const getLeadVars: GetLeadVariables = {
  id: ..., 
};

// Call the `getLeadRef()` function to get a reference to the query.
const ref = getLeadRef(getLeadVars);
// Variables can be defined inline as well.
const ref = getLeadRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getLeadRef(dataConnect, getLeadVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.lead);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.lead);
});
```

## ListLeads
You can execute the `ListLeads` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listLeads(vars?: ListLeadsVariables): QueryPromise<ListLeadsData, ListLeadsVariables>;

interface ListLeadsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: ListLeadsVariables): QueryRef<ListLeadsData, ListLeadsVariables>;
}
export const listLeadsRef: ListLeadsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listLeads(dc: DataConnect, vars?: ListLeadsVariables): QueryPromise<ListLeadsData, ListLeadsVariables>;

interface ListLeadsRef {
  ...
  (dc: DataConnect, vars?: ListLeadsVariables): QueryRef<ListLeadsData, ListLeadsVariables>;
}
export const listLeadsRef: ListLeadsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listLeadsRef:
```typescript
const name = listLeadsRef.operationName;
console.log(name);
```

### Variables
The `ListLeads` query has an optional argument of type `ListLeadsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListLeadsVariables {
  dealerId?: string | null;
  limit?: number | null;
  offset?: number | null;
}
```
### Return Type
Recall that executing the `ListLeads` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListLeadsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListLeads`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listLeads, ListLeadsVariables } from '@dataconnect/generated';

// The `ListLeads` query has an optional argument of type `ListLeadsVariables`:
const listLeadsVars: ListLeadsVariables = {
  dealerId: ..., // optional
  limit: ..., // optional
  offset: ..., // optional
};

// Call the `listLeads()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listLeads(listLeadsVars);
// Variables can be defined inline as well.
const { data } = await listLeads({ dealerId: ..., limit: ..., offset: ..., });
// Since all variables are optional for this query, you can omit the `ListLeadsVariables` argument.
const { data } = await listLeads();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listLeads(dataConnect, listLeadsVars);

console.log(data.leads);

// Or, you can use the `Promise` API.
listLeads(listLeadsVars).then((response) => {
  const data = response.data;
  console.log(data.leads);
});
```

### Using `ListLeads`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listLeadsRef, ListLeadsVariables } from '@dataconnect/generated';

// The `ListLeads` query has an optional argument of type `ListLeadsVariables`:
const listLeadsVars: ListLeadsVariables = {
  dealerId: ..., // optional
  limit: ..., // optional
  offset: ..., // optional
};

// Call the `listLeadsRef()` function to get a reference to the query.
const ref = listLeadsRef(listLeadsVars);
// Variables can be defined inline as well.
const ref = listLeadsRef({ dealerId: ..., limit: ..., offset: ..., });
// Since all variables are optional for this query, you can omit the `ListLeadsVariables` argument.
const ref = listLeadsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listLeadsRef(dataConnect, listLeadsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.leads);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.leads);
});
```

## ListHighProbabilityLeads
You can execute the `ListHighProbabilityLeads` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listHighProbabilityLeads(vars?: ListHighProbabilityLeadsVariables): QueryPromise<ListHighProbabilityLeadsData, ListHighProbabilityLeadsVariables>;

interface ListHighProbabilityLeadsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: ListHighProbabilityLeadsVariables): QueryRef<ListHighProbabilityLeadsData, ListHighProbabilityLeadsVariables>;
}
export const listHighProbabilityLeadsRef: ListHighProbabilityLeadsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listHighProbabilityLeads(dc: DataConnect, vars?: ListHighProbabilityLeadsVariables): QueryPromise<ListHighProbabilityLeadsData, ListHighProbabilityLeadsVariables>;

interface ListHighProbabilityLeadsRef {
  ...
  (dc: DataConnect, vars?: ListHighProbabilityLeadsVariables): QueryRef<ListHighProbabilityLeadsData, ListHighProbabilityLeadsVariables>;
}
export const listHighProbabilityLeadsRef: ListHighProbabilityLeadsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listHighProbabilityLeadsRef:
```typescript
const name = listHighProbabilityLeadsRef.operationName;
console.log(name);
```

### Variables
The `ListHighProbabilityLeads` query has an optional argument of type `ListHighProbabilityLeadsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListHighProbabilityLeadsVariables {
  dealerId?: string | null;
  threshold?: number | null;
  limit?: number | null;
}
```
### Return Type
Recall that executing the `ListHighProbabilityLeads` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListHighProbabilityLeadsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListHighProbabilityLeads`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listHighProbabilityLeads, ListHighProbabilityLeadsVariables } from '@dataconnect/generated';

// The `ListHighProbabilityLeads` query has an optional argument of type `ListHighProbabilityLeadsVariables`:
const listHighProbabilityLeadsVars: ListHighProbabilityLeadsVariables = {
  dealerId: ..., // optional
  threshold: ..., // optional
  limit: ..., // optional
};

// Call the `listHighProbabilityLeads()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listHighProbabilityLeads(listHighProbabilityLeadsVars);
// Variables can be defined inline as well.
const { data } = await listHighProbabilityLeads({ dealerId: ..., threshold: ..., limit: ..., });
// Since all variables are optional for this query, you can omit the `ListHighProbabilityLeadsVariables` argument.
const { data } = await listHighProbabilityLeads();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listHighProbabilityLeads(dataConnect, listHighProbabilityLeadsVars);

console.log(data.leads);

// Or, you can use the `Promise` API.
listHighProbabilityLeads(listHighProbabilityLeadsVars).then((response) => {
  const data = response.data;
  console.log(data.leads);
});
```

### Using `ListHighProbabilityLeads`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listHighProbabilityLeadsRef, ListHighProbabilityLeadsVariables } from '@dataconnect/generated';

// The `ListHighProbabilityLeads` query has an optional argument of type `ListHighProbabilityLeadsVariables`:
const listHighProbabilityLeadsVars: ListHighProbabilityLeadsVariables = {
  dealerId: ..., // optional
  threshold: ..., // optional
  limit: ..., // optional
};

// Call the `listHighProbabilityLeadsRef()` function to get a reference to the query.
const ref = listHighProbabilityLeadsRef(listHighProbabilityLeadsVars);
// Variables can be defined inline as well.
const ref = listHighProbabilityLeadsRef({ dealerId: ..., threshold: ..., limit: ..., });
// Since all variables are optional for this query, you can omit the `ListHighProbabilityLeadsVariables` argument.
const ref = listHighProbabilityLeadsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listHighProbabilityLeadsRef(dataConnect, listHighProbabilityLeadsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.leads);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.leads);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateCar
You can execute the `CreateCar` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createCar(vars: CreateCarVariables): MutationPromise<CreateCarData, CreateCarVariables>;

interface CreateCarRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateCarVariables): MutationRef<CreateCarData, CreateCarVariables>;
}
export const createCarRef: CreateCarRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createCar(dc: DataConnect, vars: CreateCarVariables): MutationPromise<CreateCarData, CreateCarVariables>;

interface CreateCarRef {
  ...
  (dc: DataConnect, vars: CreateCarVariables): MutationRef<CreateCarData, CreateCarVariables>;
}
export const createCarRef: CreateCarRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createCarRef:
```typescript
const name = createCarRef.operationName;
console.log(name);
```

### Variables
The `CreateCar` mutation requires an argument of type `CreateCarVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `CreateCar` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateCarData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateCarData {
  car_insert: Car_Key;
}
```
### Using `CreateCar`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createCar, CreateCarVariables } from '@dataconnect/generated';

// The `CreateCar` mutation requires an argument of type `CreateCarVariables`:
const createCarVars: CreateCarVariables = {
  year: ..., 
  make: ..., 
  model: ..., 
  name: ..., 
  price: ..., 
  mileage: ..., 
  type: ..., 
  category: ..., 
  condition: ..., 
  img: ..., // optional
  dealerId: ..., // optional
  featured: ..., // optional
  views: ..., // optional
  leadsCount: ..., // optional
};

// Call the `createCar()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createCar(createCarVars);
// Variables can be defined inline as well.
const { data } = await createCar({ year: ..., make: ..., model: ..., name: ..., price: ..., mileage: ..., type: ..., category: ..., condition: ..., img: ..., dealerId: ..., featured: ..., views: ..., leadsCount: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createCar(dataConnect, createCarVars);

console.log(data.car_insert);

// Or, you can use the `Promise` API.
createCar(createCarVars).then((response) => {
  const data = response.data;
  console.log(data.car_insert);
});
```

### Using `CreateCar`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createCarRef, CreateCarVariables } from '@dataconnect/generated';

// The `CreateCar` mutation requires an argument of type `CreateCarVariables`:
const createCarVars: CreateCarVariables = {
  year: ..., 
  make: ..., 
  model: ..., 
  name: ..., 
  price: ..., 
  mileage: ..., 
  type: ..., 
  category: ..., 
  condition: ..., 
  img: ..., // optional
  dealerId: ..., // optional
  featured: ..., // optional
  views: ..., // optional
  leadsCount: ..., // optional
};

// Call the `createCarRef()` function to get a reference to the mutation.
const ref = createCarRef(createCarVars);
// Variables can be defined inline as well.
const ref = createCarRef({ year: ..., make: ..., model: ..., name: ..., price: ..., mileage: ..., type: ..., category: ..., condition: ..., img: ..., dealerId: ..., featured: ..., views: ..., leadsCount: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createCarRef(dataConnect, createCarVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.car_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.car_insert);
});
```

## CreateLead
You can execute the `CreateLead` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createLead(vars: CreateLeadVariables): MutationPromise<CreateLeadData, CreateLeadVariables>;

interface CreateLeadRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateLeadVariables): MutationRef<CreateLeadData, CreateLeadVariables>;
}
export const createLeadRef: CreateLeadRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createLead(dc: DataConnect, vars: CreateLeadVariables): MutationPromise<CreateLeadData, CreateLeadVariables>;

interface CreateLeadRef {
  ...
  (dc: DataConnect, vars: CreateLeadVariables): MutationRef<CreateLeadData, CreateLeadVariables>;
}
export const createLeadRef: CreateLeadRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createLeadRef:
```typescript
const name = createLeadRef.operationName;
console.log(name);
```

### Variables
The `CreateLead` mutation requires an argument of type `CreateLeadVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `CreateLead` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateLeadData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateLeadData {
  lead_insert: Lead_Key;
}
```
### Using `CreateLead`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createLead, CreateLeadVariables } from '@dataconnect/generated';

// The `CreateLead` mutation requires an argument of type `CreateLeadVariables`:
const createLeadVars: CreateLeadVariables = {
  firstName: ..., 
  lastName: ..., 
  phone: ..., 
  email: ..., 
  vehicleOfInterest: ..., // optional
  vehicleId: ..., // optional
  type: ..., // optional
  behavioralData: ..., // optional
  aiAnalysis: ..., // optional
  marketingData: ..., // optional
  closureProbability: ..., // optional
  totalVisits: ..., // optional
};

// Call the `createLead()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createLead(createLeadVars);
// Variables can be defined inline as well.
const { data } = await createLead({ firstName: ..., lastName: ..., phone: ..., email: ..., vehicleOfInterest: ..., vehicleId: ..., type: ..., behavioralData: ..., aiAnalysis: ..., marketingData: ..., closureProbability: ..., totalVisits: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createLead(dataConnect, createLeadVars);

console.log(data.lead_insert);

// Or, you can use the `Promise` API.
createLead(createLeadVars).then((response) => {
  const data = response.data;
  console.log(data.lead_insert);
});
```

### Using `CreateLead`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createLeadRef, CreateLeadVariables } from '@dataconnect/generated';

// The `CreateLead` mutation requires an argument of type `CreateLeadVariables`:
const createLeadVars: CreateLeadVariables = {
  firstName: ..., 
  lastName: ..., 
  phone: ..., 
  email: ..., 
  vehicleOfInterest: ..., // optional
  vehicleId: ..., // optional
  type: ..., // optional
  behavioralData: ..., // optional
  aiAnalysis: ..., // optional
  marketingData: ..., // optional
  closureProbability: ..., // optional
  totalVisits: ..., // optional
};

// Call the `createLeadRef()` function to get a reference to the mutation.
const ref = createLeadRef(createLeadVars);
// Variables can be defined inline as well.
const ref = createLeadRef({ firstName: ..., lastName: ..., phone: ..., email: ..., vehicleOfInterest: ..., vehicleId: ..., type: ..., behavioralData: ..., aiAnalysis: ..., marketingData: ..., closureProbability: ..., totalVisits: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createLeadRef(dataConnect, createLeadVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.lead_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.lead_insert);
});
```

## UpdateLeadStatus
You can execute the `UpdateLeadStatus` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateLeadStatus(vars: UpdateLeadStatusVariables): MutationPromise<UpdateLeadStatusData, UpdateLeadStatusVariables>;

interface UpdateLeadStatusRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateLeadStatusVariables): MutationRef<UpdateLeadStatusData, UpdateLeadStatusVariables>;
}
export const updateLeadStatusRef: UpdateLeadStatusRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateLeadStatus(dc: DataConnect, vars: UpdateLeadStatusVariables): MutationPromise<UpdateLeadStatusData, UpdateLeadStatusVariables>;

interface UpdateLeadStatusRef {
  ...
  (dc: DataConnect, vars: UpdateLeadStatusVariables): MutationRef<UpdateLeadStatusData, UpdateLeadStatusVariables>;
}
export const updateLeadStatusRef: UpdateLeadStatusRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateLeadStatusRef:
```typescript
const name = updateLeadStatusRef.operationName;
console.log(name);
```

### Variables
The `UpdateLeadStatus` mutation requires an argument of type `UpdateLeadStatusVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateLeadStatusVariables {
  id: UUIDString;
  status: string;
}
```
### Return Type
Recall that executing the `UpdateLeadStatus` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateLeadStatusData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateLeadStatusData {
  lead_update?: Lead_Key | null;
}
```
### Using `UpdateLeadStatus`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateLeadStatus, UpdateLeadStatusVariables } from '@dataconnect/generated';

// The `UpdateLeadStatus` mutation requires an argument of type `UpdateLeadStatusVariables`:
const updateLeadStatusVars: UpdateLeadStatusVariables = {
  id: ..., 
  status: ..., 
};

// Call the `updateLeadStatus()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateLeadStatus(updateLeadStatusVars);
// Variables can be defined inline as well.
const { data } = await updateLeadStatus({ id: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateLeadStatus(dataConnect, updateLeadStatusVars);

console.log(data.lead_update);

// Or, you can use the `Promise` API.
updateLeadStatus(updateLeadStatusVars).then((response) => {
  const data = response.data;
  console.log(data.lead_update);
});
```

### Using `UpdateLeadStatus`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateLeadStatusRef, UpdateLeadStatusVariables } from '@dataconnect/generated';

// The `UpdateLeadStatus` mutation requires an argument of type `UpdateLeadStatusVariables`:
const updateLeadStatusVars: UpdateLeadStatusVariables = {
  id: ..., 
  status: ..., 
};

// Call the `updateLeadStatusRef()` function to get a reference to the mutation.
const ref = updateLeadStatusRef(updateLeadStatusVars);
// Variables can be defined inline as well.
const ref = updateLeadStatusRef({ id: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateLeadStatusRef(dataConnect, updateLeadStatusVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.lead_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.lead_update);
});
```

## UpdateLeadIntelligence
You can execute the `UpdateLeadIntelligence` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateLeadIntelligence(vars: UpdateLeadIntelligenceVariables): MutationPromise<UpdateLeadIntelligenceData, UpdateLeadIntelligenceVariables>;

interface UpdateLeadIntelligenceRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateLeadIntelligenceVariables): MutationRef<UpdateLeadIntelligenceData, UpdateLeadIntelligenceVariables>;
}
export const updateLeadIntelligenceRef: UpdateLeadIntelligenceRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateLeadIntelligence(dc: DataConnect, vars: UpdateLeadIntelligenceVariables): MutationPromise<UpdateLeadIntelligenceData, UpdateLeadIntelligenceVariables>;

interface UpdateLeadIntelligenceRef {
  ...
  (dc: DataConnect, vars: UpdateLeadIntelligenceVariables): MutationRef<UpdateLeadIntelligenceData, UpdateLeadIntelligenceVariables>;
}
export const updateLeadIntelligenceRef: UpdateLeadIntelligenceRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateLeadIntelligenceRef:
```typescript
const name = updateLeadIntelligenceRef.operationName;
console.log(name);
```

### Variables
The `UpdateLeadIntelligence` mutation requires an argument of type `UpdateLeadIntelligenceVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateLeadIntelligenceVariables {
  id: UUIDString;
  aiAnalysis?: string | null;
  closureProbability?: number | null;
  behavioralData?: string | null;
  marketingData?: string | null;
}
```
### Return Type
Recall that executing the `UpdateLeadIntelligence` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateLeadIntelligenceData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateLeadIntelligenceData {
  lead_update?: Lead_Key | null;
}
```
### Using `UpdateLeadIntelligence`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateLeadIntelligence, UpdateLeadIntelligenceVariables } from '@dataconnect/generated';

// The `UpdateLeadIntelligence` mutation requires an argument of type `UpdateLeadIntelligenceVariables`:
const updateLeadIntelligenceVars: UpdateLeadIntelligenceVariables = {
  id: ..., 
  aiAnalysis: ..., // optional
  closureProbability: ..., // optional
  behavioralData: ..., // optional
  marketingData: ..., // optional
};

// Call the `updateLeadIntelligence()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateLeadIntelligence(updateLeadIntelligenceVars);
// Variables can be defined inline as well.
const { data } = await updateLeadIntelligence({ id: ..., aiAnalysis: ..., closureProbability: ..., behavioralData: ..., marketingData: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateLeadIntelligence(dataConnect, updateLeadIntelligenceVars);

console.log(data.lead_update);

// Or, you can use the `Promise` API.
updateLeadIntelligence(updateLeadIntelligenceVars).then((response) => {
  const data = response.data;
  console.log(data.lead_update);
});
```

### Using `UpdateLeadIntelligence`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateLeadIntelligenceRef, UpdateLeadIntelligenceVariables } from '@dataconnect/generated';

// The `UpdateLeadIntelligence` mutation requires an argument of type `UpdateLeadIntelligenceVariables`:
const updateLeadIntelligenceVars: UpdateLeadIntelligenceVariables = {
  id: ..., 
  aiAnalysis: ..., // optional
  closureProbability: ..., // optional
  behavioralData: ..., // optional
  marketingData: ..., // optional
};

// Call the `updateLeadIntelligenceRef()` function to get a reference to the mutation.
const ref = updateLeadIntelligenceRef(updateLeadIntelligenceVars);
// Variables can be defined inline as well.
const ref = updateLeadIntelligenceRef({ id: ..., aiAnalysis: ..., closureProbability: ..., behavioralData: ..., marketingData: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateLeadIntelligenceRef(dataConnect, updateLeadIntelligenceVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.lead_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.lead_update);
});
```

