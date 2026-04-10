# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.




### React
For each operation, there is a wrapper hook that can be used to call the operation.

Here are all of the hooks that get generated:
```ts
import { useCreateCar, useCreateLead, useUpdateLeadStatus, useUpdateLeadIntelligence, useListCars, useGetCar, useGetLead, useListLeads, useListHighProbabilityLeads } from '@dataconnect/generated/react';
// The types of these hooks are available in react/index.d.ts

const { data, isPending, isSuccess, isError, error } = useCreateCar(createCarVars);

const { data, isPending, isSuccess, isError, error } = useCreateLead(createLeadVars);

const { data, isPending, isSuccess, isError, error } = useUpdateLeadStatus(updateLeadStatusVars);

const { data, isPending, isSuccess, isError, error } = useUpdateLeadIntelligence(updateLeadIntelligenceVars);

const { data, isPending, isSuccess, isError, error } = useListCars(listCarsVars);

const { data, isPending, isSuccess, isError, error } = useGetCar(getCarVars);

const { data, isPending, isSuccess, isError, error } = useGetLead(getLeadVars);

const { data, isPending, isSuccess, isError, error } = useListLeads(listLeadsVars);

const { data, isPending, isSuccess, isError, error } = useListHighProbabilityLeads(listHighProbabilityLeadsVars);

```

Here's an example from a different generated SDK:

```ts
import { useListAllMovies } from '@dataconnect/generated/react';

function MyComponent() {
  const { isLoading, data, error } = useListAllMovies();
  if(isLoading) {
    return <div>Loading...</div>
  }
  if(error) {
    return <div> An Error Occurred: {error} </div>
  }
}

// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MyComponent from './my-component';

function App() {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>
    <MyComponent />
  </QueryClientProvider>
}
```



## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createCar, createLead, updateLeadStatus, updateLeadIntelligence, listCars, getCar, getLead, listLeads, listHighProbabilityLeads } from '@dataconnect/generated';


// Operation CreateCar:  For variables, look at type CreateCarVars in ../index.d.ts
const { data } = await CreateCar(dataConnect, createCarVars);

// Operation CreateLead:  For variables, look at type CreateLeadVars in ../index.d.ts
const { data } = await CreateLead(dataConnect, createLeadVars);

// Operation UpdateLeadStatus:  For variables, look at type UpdateLeadStatusVars in ../index.d.ts
const { data } = await UpdateLeadStatus(dataConnect, updateLeadStatusVars);

// Operation UpdateLeadIntelligence:  For variables, look at type UpdateLeadIntelligenceVars in ../index.d.ts
const { data } = await UpdateLeadIntelligence(dataConnect, updateLeadIntelligenceVars);

// Operation ListCars:  For variables, look at type ListCarsVars in ../index.d.ts
const { data } = await ListCars(dataConnect, listCarsVars);

// Operation GetCar:  For variables, look at type GetCarVars in ../index.d.ts
const { data } = await GetCar(dataConnect, getCarVars);

// Operation GetLead:  For variables, look at type GetLeadVars in ../index.d.ts
const { data } = await GetLead(dataConnect, getLeadVars);

// Operation ListLeads:  For variables, look at type ListLeadsVars in ../index.d.ts
const { data } = await ListLeads(dataConnect, listLeadsVars);

// Operation ListHighProbabilityLeads:  For variables, look at type ListHighProbabilityLeadsVars in ../index.d.ts
const { data } = await ListHighProbabilityLeads(dataConnect, listHighProbabilityLeadsVars);


```