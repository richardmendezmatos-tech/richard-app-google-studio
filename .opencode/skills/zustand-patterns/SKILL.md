---
name: zustand-patterns
description: Zustand store conventions for this project — basic stores, persist with sessionStorage, and localStorage patterns
---

# Zustand Store Patterns

## Pattern 1: Basic Store (No Persist)
```typescript
import { create } from 'zustand'

interface AuthState {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ isLoading: loading }),
}))
```

## Pattern 2: Store with sessionStorage Persist
```typescript
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface TrajectoryState {
  path: string[]
  addPath: (segment: string) => void
  clear: () => void
}

export const useTrajectoryStore = create<TrajectoryState>()(
  persist(
    (set) => ({
      path: [],
      addPath: (segment) => set((s) => ({ path: [...s.path, segment] })),
      clear: () => set({ path: [] }),
    }),
    {
      name: 'trajectory-storage',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
)
```

## Pattern 3: Avoid manual localStorage
If you need to sync with localStorage, use the persist middleware (Pattern 2) instead of manual getItem/setItem.

## Naming Convention
- File: `use<Name>Store.ts`
- Variable: `use<Name>Store`
- Location: `entities/<domain>/model/` or `features/<domain>/model/`

## Testing Stores
```typescript
import { useAuthStore } from './useAuthStore'

beforeEach(() => {
  useAuthStore.setState({ user: null, isLoading: false })
})

it('sets user', () => {
  const mockUser = { id: '1', email: 'test@test.com' }
  useAuthStore.getState().setUser(mockUser)
  expect(useAuthStore.getState().user).toEqual(mockUser)
})
```
