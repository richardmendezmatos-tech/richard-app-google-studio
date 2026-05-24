---
name: database-migration
description: Use ONLY when the task involves creating or applying Supabase database migrations, modifying schema, adding indexes, triggers, RLS policies, or encryption. Also for query performance tuning and index optimization.
---

# Database Migration

Workflow para crear y aplicar migraciones de Supabase PostgreSQL en Richard Automotive Command Center.

## 1. Crear el archivo de migración

Crear en `supabase/migrations/` con formato timestamp:

```
YYYYMMDDHHMMSS_description.sql
```

Ejemplo:
```
20260524000001_add_search_indexes.sql
```

## 2. Convenciones SQL

```sql
-- Safe CREATE OR REPLACE para funciones
CREATE OR REPLACE FUNCTION public.my_function()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- ... body ...
END;
$$;

-- Triggers con search_path
CREATE TRIGGER my_trigger
  BEFORE INSERT ON public.my_table
  FOR EACH ROW
  EXECUTE FUNCTION public.my_function();

SET search_path = public, extensions;
```

## 3. Aplicar migración via Management API

```bash
curl -X POST "https://api.supabase.com/v1/projects/dizzjfijsmxdlnfqydfk/sql" \
  -H "Authorization: Bearer ${SUPABASE_PAT}" \
  -H "Content-Type: application/json" \
  -d "$(jq -Rs '{query: .}' < supabase/migrations/YYYYMMDDHHMMSS_description.sql)"
```

## 4. Verificar migración

```bash
# Listar migraciones aplicadas
curl -H "Authorization: Bearer ${SUPABASE_PAT}" \
  "https://api.supabase.com/v1/projects/dizzjfijsmxdlnfqydfk/database/migrations" | jq
```

## 5. Verificación de esquema

```bash
# Ejecutar query de verificación
curl -X POST "https://api.supabase.com/v1/projects/dizzjfijsmxdlnfqydfk/sql" \
  -H "Authorization: Bearer ${SUPABASE_PAT}" \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT table_name, indexname, indexdef FROM pg_indexes WHERE schemaname = '\''public'\'' ORDER BY table_name, indexname;"}' | jq
```

## Reglas importantes

- NO usar service role key (bloqueada). Solo PAT `sbp_9c5a...`
- NO usar conexión directa PostgreSQL (IPv6 bloqueada)
- SSN/phone encryption: solo cipher `aes` con `pgsodium`
- Índices: siempre verificar columnas existen antes de crear
- Preferir `count: 'estimated'` sobre `'exact'` en Supabase queries
- Nunca usar `select *` en producción
- Siempre agregar `.limit()` en queries unbounded
- Triggers: siempre incluir `SET search_path = public, extensions`
