# Architecture Guide

## Layering

The codebase should follow this dependency direction:

1. `src/infra` (SDKs, external adapters)
2. `src/services` (legacy facade + cross-domain orchestration)
3. `src/features` (domain modules and UI by business context)
4. `src/components` (shared UI)

Rules:

- `src/infra` must not import from `src/features` or `src/components`.
- `src/services` must not import from `src/features`.
- Feature modules should import infra through stable service or infra contracts.

## Firebase Structure

- `src/infra/firebase/client.ts`: app/auth/db bootstrap.
- `src/infra/firebase/optionalServices.ts`: lazy optional SDK services.
- `src/services/firebaseService.ts`: compatibility facade for existing imports.

## Migration Strategy

1. Move new infrastructure integrations into `src/infra`.
2. Replace direct legacy imports with infra modules incrementally.
3. Keep backward compatibility in `src/services/*` during migration.
4. Remove legacy facade exports once all features migrate.

## Quality Gates

Before any release:

1. `npm run lint`
2. `npm run test`
3. `npm run build`

