# 🗄️ SQLs para Executar no Supabase

## ⚠️ IMPORTANTE

Execute os SQLs **NA ORDEM** apresentada abaixo no SQL Editor do Supabase.

**Link:** https://supabase.com/dashboard/project/usidtjpjymomofyqolwe/sql/new

---

## 1️⃣ Migration 005: Multi-Tenant Setup

**Arquivo:** `supabase/migrations/005_multi_tenant_setup.sql`

**O que faz:**
- Cria tabelas `organizations` e `profiles`
- Adiciona coluna `organization_id` em `patients`, `appointments`, `settings`
- **DELETA todos os dados existentes** (conforme solicitado)
- Cria função helper `get_user_organization_id()`
- Cria organização de demonstração

**Cole e execute:**

```sql
-- =====================================================
-- MIGRATION 005: Multi-Tenant Setup
-- =====================================================

-- 1. CRIAR TABELA DE ORGANIZAÇÕES
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  settings JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true
);

COMMENT ON TABLE organizations IS 'Organizações (clínicas/consultórios) do sistema';
COMMENT ON COLUMN organizations.slug IS 'Identificador único amigável da organização';

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);

-- 2. CRIAR TABELA DE PERFIS
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'doctor',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'doctor', 'assistant'))
);

COMMENT ON TABLE profiles IS 'Perfis de usuários vinculados às organizações';
COMMENT ON COLUMN profiles.id IS 'Referência ao auth.users do Supabase';
COMMENT ON COLUMN profiles.role IS 'Papel do usuário: admin, doctor ou assistant';

CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 3. DELETAR DADOS EXISTENTES
TRUNCATE TABLE appointments CASCADE;
TRUNCATE TABLE patients CASCADE;
TRUNCATE TABLE settings CASCADE;

-- 4. ADICIONAR organization_id NAS TABELAS

-- Tabela patients
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

ALTER TABLE patients 
ALTER COLUMN organization_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_patients_organization_id ON patients(organization_id);

-- Tabela appointments
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

ALTER TABLE appointments 
ALTER COLUMN organization_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_appointments_organization_id ON appointments(organization_id);

-- Tabela settings
ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

ALTER TABLE settings 
ALTER COLUMN organization_id SET NOT NULL;

ALTER TABLE settings 
ADD CONSTRAINT settings_organization_unique UNIQUE(organization_id);

CREATE INDEX IF NOT EXISTS idx_settings_organization_id ON settings(organization_id);

-- 5. FUNÇÃO HELPER
CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID AS $$
  SELECT organization_id 
  FROM profiles 
  WHERE id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION get_user_organization_id() IS 'Retorna o organization_id do usuário autenticado';

-- 6. FUNÇÃO: Gerar slug
CREATE OR REPLACE FUNCTION generate_slug(name TEXT)
RETURNS TEXT AS $$
  SELECT lower(
    regexp_replace(
      regexp_replace(
        trim(name), 
        '[^a-zA-Z0-9\s-]', '', 'g'
      ),
      '\s+', '-', 'g'
    )
  );
$$ LANGUAGE sql IMMUTABLE;

-- 7. SEED: Organização demo
INSERT INTO organizations (name, slug, settings)
VALUES (
  'Clínica Demo',
  'clinica-demo',
  '{"theme": "light", "locale": "pt-BR"}'::jsonb
)
ON CONFLICT (slug) DO NOTHING;
```

---

## 2️⃣ Migration 006: Enable RLS (Row Level Security)

**Arquivo:** `supabase/migrations/006_enable_rls.sql`

**O que faz:**
- Habilita RLS em todas as tabelas
- Cria policies de segurança
- Isola dados por organização
- Garante que cada usuário só veja dados da sua organização

**Cole e execute:**

```sql
-- =====================================================
-- MIGRATION 006: Enable Row Level Security (RLS)
-- =====================================================

-- 1. HABILITAR RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 2. POLICIES PARA ORGANIZATIONS
CREATE POLICY "Users can view their organization"
  ON organizations FOR SELECT
  USING (id = get_user_organization_id());

CREATE POLICY "Admins can update their organization"
  ON organizations FOR UPDATE
  USING (
    id = get_user_organization_id() 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 3. POLICIES PARA PROFILES
CREATE POLICY "Users can view profiles in their organization"
  ON profiles FOR SELECT
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "System can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- 4. POLICIES PARA PATIENTS
CREATE POLICY "Users can view patients in their organization"
  ON patients FOR SELECT
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can insert patients in their organization"
  ON patients FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can update patients in their organization"
  ON patients FOR UPDATE
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can delete patients in their organization"
  ON patients FOR DELETE
  USING (organization_id = get_user_organization_id());

-- 5. POLICIES PARA APPOINTMENTS
CREATE POLICY "Users can view appointments in their organization"
  ON appointments FOR SELECT
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can insert appointments in their organization"
  ON appointments FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can update appointments in their organization"
  ON appointments FOR UPDATE
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can delete appointments in their organization"
  ON appointments FOR DELETE
  USING (organization_id = get_user_organization_id());

-- 6. POLICIES PARA SETTINGS
CREATE POLICY "Users can view their organization settings"
  ON settings FOR SELECT
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can update settings"
  ON settings FOR UPDATE
  USING (
    organization_id = get_user_organization_id()
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "System can insert settings"
  ON settings FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id());

-- 7. GRANT PERMISSIONS
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
```

---

## ✅ Verificação

Após executar os SQLs, verifique:

### 1. Tabelas criadas

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('organizations', 'profiles')
ORDER BY table_name;
```

**Resultado esperado:** 2 linhas (organizations, profiles)

### 2. Colunas organization_id adicionadas

```sql
SELECT table_name, column_name 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND column_name = 'organization_id'
ORDER BY table_name;
```

**Resultado esperado:** 3 linhas (appointments, patients, settings)

### 3. RLS habilitado

```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('organizations', 'profiles', 'patients', 'appointments', 'settings');
```

**Resultado esperado:** Todas com `rowsecurity = true`

### 4. Policies criadas

```sql
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Resultado esperado:** Várias policies listadas

---

## 🎉 Pronto!

Após executar os SQLs com sucesso:

1. ✅ Estrutura multi-tenant criada
2. ✅ Dados isolados por organização
3. ✅ RLS ativado e configurado
4. ✅ Sistema pronto para cadastro de usuários

### Próximo Passo

Acesse a aplicação e faça seu cadastro em:
**http://localhost:5173/register**

O primeiro usuário de cada organização será automaticamente **admin**.

---

**Data:** 26/11/2024

