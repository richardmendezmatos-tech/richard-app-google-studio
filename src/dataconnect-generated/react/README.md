# Generated React README
This README will guide you through the process of using the generated React SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `JavaScript README`, you can find it at [`dataconnect-generated/README.md`](../README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

You can use this generated SDK by importing from the package `@dataconnect/generated/react` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#react).

# Table of Contents
- [**Overview**](#generated-react-readme)
- [**TanStack Query Firebase & TanStack React Query**](#tanstack-query-firebase-tanstack-react-query)
  - [*Package Installation*](#installing-tanstack-query-firebase-and-tanstack-react-query-packages)
  - [*Configuring TanStack Query*](#configuring-tanstack-query)
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

# TanStack Query Firebase & TanStack React Query
This SDK provides [React](https://react.dev/) hooks generated specific to your application, for the operations found in the connector `example`. These hooks are generated using [TanStack Query Firebase](https://react-query-firebase.invertase.dev/) by our partners at Invertase, a library built on top of [TanStack React Query v5](https://tanstack.com/query/v5/docs/framework/react/overview).

***You do not need to be familiar with Tanstack Query or Tanstack Query Firebase to use this SDK.*** However, you may find it useful to learn more about them, as they will empower you as a user of this Generated React SDK.

## Installing TanStack Query Firebase and TanStack React Query Packages
In order to use the React generated SDK, you must install the `TanStack React Query` and `TanStack Query Firebase` packages.
```bash
npm i --save @tanstack/react-query @tanstack-query-firebase/react
```
```bash
npm i --save firebase@latest # Note: React has a peer dependency on ^11.3.0
```

You can also follow the installation instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#tanstack-install), or the [TanStack Query Firebase documentation](https://react-query-firebase.invertase.dev/react) and [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/installation).

## Configuring TanStack Query
In order to use the React generated SDK in your application, you must wrap your application's component tree in a `QueryClientProvider` component from TanStack React Query. None of your generated React SDK hooks will work without this provider.

```javascript
import { QueryClientProvider } from '@tanstack/react-query';

// Create a TanStack Query client instance
const queryClient = new QueryClient()

function App() {
  return (
    // Provide the client to your App
    <QueryClientProvider client={queryClient}>
      <MyApplication />
    </QueryClientProvider>
  )
}
```

To learn more about `QueryClientProvider`, see the [TanStack React Query documentation](https://tanstack.com/query/latest/docs/framework/react/quick-start) and the [TanStack Query Firebase documentation](https://invertase.docs.page/tanstack-query-firebase/react#usage).

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`.

You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#emulator-react-angular).

```javascript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) using the hooks provided from your generated React SDK.

# Queries

The React generated SDK provides Query hook functions that call and return [`useDataConnectQuery`](https://react-query-firebase.invertase.dev/react/data-connect/querying) hooks from TanStack Query Firebase.

Calling these hook functions will return a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and the most recent data returned by the Query, among other things. To learn more about these hooks and how to use them, see the [TanStack Query Firebase documentation](https://react-query-firebase.invertase.dev/react/data-connect/querying).

TanStack React Query caches the results of your Queries, so using the same Query hook function in multiple places in your application allows the entire application to automatically see updates to that Query's data.

Query hooks execute their Queries automatically when called, and periodically refresh, unless you change the `queryOptions` for the Query. To learn how to stop a Query from automatically executing, including how to make a query "lazy", see the [TanStack React Query documentation](https://tanstack.com/query/latest/docs/framework/react/guides/disabling-queries).

To learn more about TanStack React Query's Queries, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/guides/queries).

## Using Query Hooks
Here's a general overview of how to use the generated Query hooks in your code:

- If the Query has no variables, the Query hook function does not require arguments.
- If the Query has any required variables, the Query hook function will require at least one argument: an object that contains all the required variables for the Query.
- If the Query has some required and some optional variables, only required variables are necessary in the variables argument object, and optional variables may be provided as well.
- If all of the Query's variables are optional, the Query hook function does not require any arguments.
- Query hook functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.
- Query hooks functions can be called with or without passing in an `options` argument of type `useDataConnectQueryOptions`. To learn more about the `options` argument, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/guides/query-options).
  - ***Special case:***  If the Query has all optional variables and you would like to provide an `options` argument to the Query hook function without providing any variables, you must pass `undefined` where you would normally pass the Query's variables, and then may provide the `options` argument.

Below are examples of how to use the `example` connector's generated Query hook functions to execute each Query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#operations-react-angular).

## ListCars
You can execute the `ListCars` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useListCars(dc: DataConnect, vars?: ListCarsVariables, options?: useDataConnectQueryOptions<ListCarsData>): UseDataConnectQueryResult<ListCarsData, ListCarsVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListCars(vars?: ListCarsVariables, options?: useDataConnectQueryOptions<ListCarsData>): UseDataConnectQueryResult<ListCarsData, ListCarsVariables>;
```

### Variables
The `ListCars` Query has an optional argument of type `ListCarsVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface ListCarsVariables {
  limit?: number | null;
  offset?: number | null;
  dealerId?: string | null;
}
```
### Return Type
Recall that calling the `ListCars` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `ListCars` Query is of type `ListCarsData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListCars`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, ListCarsVariables } from '@dataconnect/generated';
import { useListCars } from '@dataconnect/generated/react'

export default function ListCarsComponent() {
  // The `useListCars` Query hook has an optional argument of type `ListCarsVariables`:
  const listCarsVars: ListCarsVariables = {
    limit: ..., // optional
    offset: ..., // optional
    dealerId: ..., // optional
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListCars(listCarsVars);
  // Variables can be defined inline as well.
  const query = useListCars({ limit: ..., offset: ..., dealerId: ..., });
  // Since all variables are optional for this Query, you can omit the `ListCarsVariables` argument.
  // (as long as you don't want to provide any `options`!)
  const query = useListCars();

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListCars(dataConnect, listCarsVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListCars(listCarsVars, options);
  // If you'd like to provide options without providing any variables, you must
  // pass `undefined` where you would normally pass the variables.
  const query = useListCars(undefined, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListCars(dataConnect, listCarsVars /** or undefined */, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.cars);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## GetCar
You can execute the `GetCar` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useGetCar(dc: DataConnect, vars: GetCarVariables, options?: useDataConnectQueryOptions<GetCarData>): UseDataConnectQueryResult<GetCarData, GetCarVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useGetCar(vars: GetCarVariables, options?: useDataConnectQueryOptions<GetCarData>): UseDataConnectQueryResult<GetCarData, GetCarVariables>;
```

### Variables
The `GetCar` Query requires an argument of type `GetCarVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface GetCarVariables {
  id: UUIDString;
}
```
### Return Type
Recall that calling the `GetCar` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `GetCar` Query is of type `GetCarData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `GetCar`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, GetCarVariables } from '@dataconnect/generated';
import { useGetCar } from '@dataconnect/generated/react'

export default function GetCarComponent() {
  // The `useGetCar` Query hook requires an argument of type `GetCarVariables`:
  const getCarVars: GetCarVariables = {
    id: ..., 
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useGetCar(getCarVars);
  // Variables can be defined inline as well.
  const query = useGetCar({ id: ..., });

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useGetCar(dataConnect, getCarVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useGetCar(getCarVars, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useGetCar(dataConnect, getCarVars, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.car);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## GetLead
You can execute the `GetLead` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useGetLead(dc: DataConnect, vars: GetLeadVariables, options?: useDataConnectQueryOptions<GetLeadData>): UseDataConnectQueryResult<GetLeadData, GetLeadVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useGetLead(vars: GetLeadVariables, options?: useDataConnectQueryOptions<GetLeadData>): UseDataConnectQueryResult<GetLeadData, GetLeadVariables>;
```

### Variables
The `GetLead` Query requires an argument of type `GetLeadVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface GetLeadVariables {
  id: UUIDString;
}
```
### Return Type
Recall that calling the `GetLead` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `GetLead` Query is of type `GetLeadData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `GetLead`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, GetLeadVariables } from '@dataconnect/generated';
import { useGetLead } from '@dataconnect/generated/react'

export default function GetLeadComponent() {
  // The `useGetLead` Query hook requires an argument of type `GetLeadVariables`:
  const getLeadVars: GetLeadVariables = {
    id: ..., 
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useGetLead(getLeadVars);
  // Variables can be defined inline as well.
  const query = useGetLead({ id: ..., });

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useGetLead(dataConnect, getLeadVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useGetLead(getLeadVars, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useGetLead(dataConnect, getLeadVars, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.lead);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## ListLeads
You can execute the `ListLeads` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useListLeads(dc: DataConnect, vars?: ListLeadsVariables, options?: useDataConnectQueryOptions<ListLeadsData>): UseDataConnectQueryResult<ListLeadsData, ListLeadsVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListLeads(vars?: ListLeadsVariables, options?: useDataConnectQueryOptions<ListLeadsData>): UseDataConnectQueryResult<ListLeadsData, ListLeadsVariables>;
```

### Variables
The `ListLeads` Query has an optional argument of type `ListLeadsVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface ListLeadsVariables {
  dealerId?: string | null;
  limit?: number | null;
  offset?: number | null;
}
```
### Return Type
Recall that calling the `ListLeads` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `ListLeads` Query is of type `ListLeadsData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListLeads`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, ListLeadsVariables } from '@dataconnect/generated';
import { useListLeads } from '@dataconnect/generated/react'

export default function ListLeadsComponent() {
  // The `useListLeads` Query hook has an optional argument of type `ListLeadsVariables`:
  const listLeadsVars: ListLeadsVariables = {
    dealerId: ..., // optional
    limit: ..., // optional
    offset: ..., // optional
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListLeads(listLeadsVars);
  // Variables can be defined inline as well.
  const query = useListLeads({ dealerId: ..., limit: ..., offset: ..., });
  // Since all variables are optional for this Query, you can omit the `ListLeadsVariables` argument.
  // (as long as you don't want to provide any `options`!)
  const query = useListLeads();

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListLeads(dataConnect, listLeadsVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListLeads(listLeadsVars, options);
  // If you'd like to provide options without providing any variables, you must
  // pass `undefined` where you would normally pass the variables.
  const query = useListLeads(undefined, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListLeads(dataConnect, listLeadsVars /** or undefined */, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.leads);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## ListHighProbabilityLeads
You can execute the `ListHighProbabilityLeads` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useListHighProbabilityLeads(dc: DataConnect, vars?: ListHighProbabilityLeadsVariables, options?: useDataConnectQueryOptions<ListHighProbabilityLeadsData>): UseDataConnectQueryResult<ListHighProbabilityLeadsData, ListHighProbabilityLeadsVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListHighProbabilityLeads(vars?: ListHighProbabilityLeadsVariables, options?: useDataConnectQueryOptions<ListHighProbabilityLeadsData>): UseDataConnectQueryResult<ListHighProbabilityLeadsData, ListHighProbabilityLeadsVariables>;
```

### Variables
The `ListHighProbabilityLeads` Query has an optional argument of type `ListHighProbabilityLeadsVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface ListHighProbabilityLeadsVariables {
  dealerId?: string | null;
  threshold?: number | null;
  limit?: number | null;
}
```
### Return Type
Recall that calling the `ListHighProbabilityLeads` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `ListHighProbabilityLeads` Query is of type `ListHighProbabilityLeadsData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListHighProbabilityLeads`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, ListHighProbabilityLeadsVariables } from '@dataconnect/generated';
import { useListHighProbabilityLeads } from '@dataconnect/generated/react'

export default function ListHighProbabilityLeadsComponent() {
  // The `useListHighProbabilityLeads` Query hook has an optional argument of type `ListHighProbabilityLeadsVariables`:
  const listHighProbabilityLeadsVars: ListHighProbabilityLeadsVariables = {
    dealerId: ..., // optional
    threshold: ..., // optional
    limit: ..., // optional
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListHighProbabilityLeads(listHighProbabilityLeadsVars);
  // Variables can be defined inline as well.
  const query = useListHighProbabilityLeads({ dealerId: ..., threshold: ..., limit: ..., });
  // Since all variables are optional for this Query, you can omit the `ListHighProbabilityLeadsVariables` argument.
  // (as long as you don't want to provide any `options`!)
  const query = useListHighProbabilityLeads();

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListHighProbabilityLeads(dataConnect, listHighProbabilityLeadsVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListHighProbabilityLeads(listHighProbabilityLeadsVars, options);
  // If you'd like to provide options without providing any variables, you must
  // pass `undefined` where you would normally pass the variables.
  const query = useListHighProbabilityLeads(undefined, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListHighProbabilityLeads(dataConnect, listHighProbabilityLeadsVars /** or undefined */, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.leads);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

# Mutations

The React generated SDK provides Mutations hook functions that call and return [`useDataConnectMutation`](https://react-query-firebase.invertase.dev/react/data-connect/mutations) hooks from TanStack Query Firebase.

Calling these hook functions will return a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, and the most recent data returned by the Mutation, among other things. To learn more about these hooks and how to use them, see the [TanStack Query Firebase documentation](https://react-query-firebase.invertase.dev/react/data-connect/mutations).

Mutation hooks do not execute their Mutations automatically when called. Rather, after calling the Mutation hook function and getting a `UseMutationResult` object, you must call the `UseMutationResult.mutate()` function to execute the Mutation.

To learn more about TanStack React Query's Mutations, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/guides/mutations).

## Using Mutation Hooks
Here's a general overview of how to use the generated Mutation hooks in your code:

- Mutation hook functions are not called with the arguments to the Mutation. Instead, arguments are passed to `UseMutationResult.mutate()`.
- If the Mutation has no variables, the `mutate()` function does not require arguments.
- If the Mutation has any required variables, the `mutate()` function will require at least one argument: an object that contains all the required variables for the Mutation.
- If the Mutation has some required and some optional variables, only required variables are necessary in the variables argument object, and optional variables may be provided as well.
- If all of the Mutation's variables are optional, the Mutation hook function does not require any arguments.
- Mutation hook functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.
- Mutation hooks also accept an `options` argument of type `useDataConnectMutationOptions`. To learn more about the `options` argument, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/guides/mutations#mutation-side-effects).
  - `UseMutationResult.mutate()` also accepts an `options` argument of type `useDataConnectMutationOptions`.
  - ***Special case:*** If the Mutation has no arguments (or all optional arguments and you wish to provide none), and you want to pass `options` to `UseMutationResult.mutate()`, you must pass `undefined` where you would normally pass the Mutation's arguments, and then may provide the options argument.

Below are examples of how to use the `example` connector's generated Mutation hook functions to execute each Mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#operations-react-angular).

## CreateCar
You can execute the `CreateCar` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useCreateCar(options?: useDataConnectMutationOptions<CreateCarData, FirebaseError, CreateCarVariables>): UseDataConnectMutationResult<CreateCarData, CreateCarVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useCreateCar(dc: DataConnect, options?: useDataConnectMutationOptions<CreateCarData, FirebaseError, CreateCarVariables>): UseDataConnectMutationResult<CreateCarData, CreateCarVariables>;
```

### Variables
The `CreateCar` Mutation requires an argument of type `CreateCarVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
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
Recall that calling the `CreateCar` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `CreateCar` Mutation is of type `CreateCarData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface CreateCarData {
  car_insert: Car_Key;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `CreateCar`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, CreateCarVariables } from '@dataconnect/generated';
import { useCreateCar } from '@dataconnect/generated/react'

export default function CreateCarComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useCreateCar();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useCreateCar(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateCar(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateCar(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useCreateCar` Mutation requires an argument of type `CreateCarVariables`:
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
  mutation.mutate(createCarVars);
  // Variables can be defined inline as well.
  mutation.mutate({ year: ..., make: ..., model: ..., name: ..., price: ..., mileage: ..., type: ..., category: ..., condition: ..., img: ..., dealerId: ..., featured: ..., views: ..., leadsCount: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(createCarVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.car_insert);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## CreateLead
You can execute the `CreateLead` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useCreateLead(options?: useDataConnectMutationOptions<CreateLeadData, FirebaseError, CreateLeadVariables>): UseDataConnectMutationResult<CreateLeadData, CreateLeadVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useCreateLead(dc: DataConnect, options?: useDataConnectMutationOptions<CreateLeadData, FirebaseError, CreateLeadVariables>): UseDataConnectMutationResult<CreateLeadData, CreateLeadVariables>;
```

### Variables
The `CreateLead` Mutation requires an argument of type `CreateLeadVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
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
Recall that calling the `CreateLead` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `CreateLead` Mutation is of type `CreateLeadData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface CreateLeadData {
  lead_insert: Lead_Key;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `CreateLead`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, CreateLeadVariables } from '@dataconnect/generated';
import { useCreateLead } from '@dataconnect/generated/react'

export default function CreateLeadComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useCreateLead();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useCreateLead(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateLead(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateLead(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useCreateLead` Mutation requires an argument of type `CreateLeadVariables`:
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
  mutation.mutate(createLeadVars);
  // Variables can be defined inline as well.
  mutation.mutate({ firstName: ..., lastName: ..., phone: ..., email: ..., vehicleOfInterest: ..., vehicleId: ..., type: ..., behavioralData: ..., aiAnalysis: ..., marketingData: ..., closureProbability: ..., totalVisits: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(createLeadVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.lead_insert);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## UpdateLeadStatus
You can execute the `UpdateLeadStatus` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useUpdateLeadStatus(options?: useDataConnectMutationOptions<UpdateLeadStatusData, FirebaseError, UpdateLeadStatusVariables>): UseDataConnectMutationResult<UpdateLeadStatusData, UpdateLeadStatusVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useUpdateLeadStatus(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateLeadStatusData, FirebaseError, UpdateLeadStatusVariables>): UseDataConnectMutationResult<UpdateLeadStatusData, UpdateLeadStatusVariables>;
```

### Variables
The `UpdateLeadStatus` Mutation requires an argument of type `UpdateLeadStatusVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface UpdateLeadStatusVariables {
  id: UUIDString;
  status: string;
}
```
### Return Type
Recall that calling the `UpdateLeadStatus` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `UpdateLeadStatus` Mutation is of type `UpdateLeadStatusData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface UpdateLeadStatusData {
  lead_update?: Lead_Key | null;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `UpdateLeadStatus`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, UpdateLeadStatusVariables } from '@dataconnect/generated';
import { useUpdateLeadStatus } from '@dataconnect/generated/react'

export default function UpdateLeadStatusComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useUpdateLeadStatus();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useUpdateLeadStatus(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useUpdateLeadStatus(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useUpdateLeadStatus(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useUpdateLeadStatus` Mutation requires an argument of type `UpdateLeadStatusVariables`:
  const updateLeadStatusVars: UpdateLeadStatusVariables = {
    id: ..., 
    status: ..., 
  };
  mutation.mutate(updateLeadStatusVars);
  // Variables can be defined inline as well.
  mutation.mutate({ id: ..., status: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(updateLeadStatusVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.lead_update);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## UpdateLeadIntelligence
You can execute the `UpdateLeadIntelligence` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useUpdateLeadIntelligence(options?: useDataConnectMutationOptions<UpdateLeadIntelligenceData, FirebaseError, UpdateLeadIntelligenceVariables>): UseDataConnectMutationResult<UpdateLeadIntelligenceData, UpdateLeadIntelligenceVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useUpdateLeadIntelligence(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateLeadIntelligenceData, FirebaseError, UpdateLeadIntelligenceVariables>): UseDataConnectMutationResult<UpdateLeadIntelligenceData, UpdateLeadIntelligenceVariables>;
```

### Variables
The `UpdateLeadIntelligence` Mutation requires an argument of type `UpdateLeadIntelligenceVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface UpdateLeadIntelligenceVariables {
  id: UUIDString;
  aiAnalysis?: string | null;
  closureProbability?: number | null;
  behavioralData?: string | null;
  marketingData?: string | null;
}
```
### Return Type
Recall that calling the `UpdateLeadIntelligence` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `UpdateLeadIntelligence` Mutation is of type `UpdateLeadIntelligenceData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface UpdateLeadIntelligenceData {
  lead_update?: Lead_Key | null;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `UpdateLeadIntelligence`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, UpdateLeadIntelligenceVariables } from '@dataconnect/generated';
import { useUpdateLeadIntelligence } from '@dataconnect/generated/react'

export default function UpdateLeadIntelligenceComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useUpdateLeadIntelligence();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useUpdateLeadIntelligence(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useUpdateLeadIntelligence(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useUpdateLeadIntelligence(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useUpdateLeadIntelligence` Mutation requires an argument of type `UpdateLeadIntelligenceVariables`:
  const updateLeadIntelligenceVars: UpdateLeadIntelligenceVariables = {
    id: ..., 
    aiAnalysis: ..., // optional
    closureProbability: ..., // optional
    behavioralData: ..., // optional
    marketingData: ..., // optional
  };
  mutation.mutate(updateLeadIntelligenceVars);
  // Variables can be defined inline as well.
  mutation.mutate({ id: ..., aiAnalysis: ..., closureProbability: ..., behavioralData: ..., marketingData: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(updateLeadIntelligenceVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.lead_update);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

