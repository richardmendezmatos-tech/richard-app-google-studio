---
name: supabase-rls
description: "Supabase RLS security patterns for Richard Automotive. 19 policies across 9 tables. Use when modifying RLS, adding new tables, or auditing security."
---

# Supabase RLS Security Pattern

## Principio

RLS siempre habilitado en tablas del schema `public`. 3 niveles de acceso:
- **service_role**: acceso total (backend via service key)
- **admin/agent**: SELECT en datos de negocio
- **público anónimo**: INSERT limitado + SELECT limitado

## Patrón por tipo de tabla

### 1. Tablas de datos sensibles (leads, deals)

```sql
CREATE POLICY "service_role_all" ON leads FOR ALL TO service_role USING (true);
CREATE POLICY "admins_select" ON leads FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'email' = 'richardmendezmatos@gmail.com'
    OR auth.jwt() ->> 'email' LIKE '%@richard-automotive.com');
CREATE POLICY "public_insert" ON leads FOR INSERT TO anon WITH CHECK (true);
```

### 2. Tablas públicas (blog_posts, ford_news_cache)

```sql
CREATE POLICY "public_select" ON blog_posts FOR SELECT TO anon USING (true);
CREATE POLICY "admins_all" ON blog_posts FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');
```

### 3. Tablas de sistema (sentinel_metrics, system_logs)

```sql
CREATE POLICY "service_role_all" ON sentinel_metrics FOR ALL TO service_role USING (true);
CREATE POLICY "admins_select" ON sentinel_metrics FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');
```

## 19 políticas activas (9 tablas)

| Tabla | Políticas | Acceso público |
|-------|-----------|---------------|
| leads | service_role ALL, admins SELECT, admin/agent SELECT, public INSERT, admins UPDATE | INSERT |
| deals | service_role ALL, admin/agent SELECT, public INSERT | INSERT |
| api_keys | service_role ALL, users SELECT own | No |
| blog_posts | public SELECT, admins ALL | SELECT |
| ford_news_cache | public SELECT, service_role ALL | SELECT |
| sentinel_metrics | service_role ALL, admins SELECT | No |
| system_logs | service_role ALL, admins SELECT | No |
| distribution_logs | service_role ALL | No |
| market_insights | public SELECT, service_role ALL | SELECT |

## Verificación

```sql
-- Listar todas las políticas activas
SELECT relname, polname,
  CASE polcmd
    WHEN '*' THEN 'ALL' WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT' WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
  END AS cmd
FROM pg_policy
JOIN pg_class ON pg_class.oid = polrelid
WHERE pg_class.relnamespace = 'public'::regnamespace
ORDER BY 1, 2;
```

## Checklist al agregar tabla

1. `ALTER TABLE ENABLE ROW LEVEL SECURITY`
2. Política `service_role ALL` (backend)
3. Política para admins según datos
4. Política pública solo si necesario (SELECT o INSERT)
5. Revocar acceso público si la tabla es interna
