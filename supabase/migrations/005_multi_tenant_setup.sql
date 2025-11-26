-- =====================================================
-- MIGRATION 005: Multi-Tenant Setup
-- =====================================================
-- Criar estrutura para múltiplas organizações (clínicas)
-- Cada organização terá seus próprios dados isolados

-- 1. CRIAR TABELA DE ORGANIZAÇÕES
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  settings JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true
);

-- Comentário
COMMENT ON TABLE organizations IS 'Organizações (clínicas/consultórios) do sistema';
COMMENT ON COLUMN organizations.slug IS 'Identificador único amigável da organização';

-- Índice
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);

-- 2. CRIAR TABELA DE PERFIS (vinculada ao auth.users)
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

-- Comentários
COMMENT ON TABLE profiles IS 'Perfis de usuários vinculados às organizações';
COMMENT ON COLUMN profiles.id IS 'Referência ao auth.users do Supabase';
COMMENT ON COLUMN profiles.role IS 'Papel do usuário: admin, doctor ou assistant';

-- Índices
CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 3. DELETAR DADOS EXISTENTES (conforme solicitado)
TRUNCATE TABLE appointments CASCADE;
TRUNCATE TABLE patients CASCADE;
TRUNCATE TABLE settings CASCADE;

-- 4. ADICIONAR organization_id NAS TABELAS EXISTENTES

-- Tabela patients
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Tornar organization_id obrigatório após migração
ALTER TABLE patients 
ALTER COLUMN organization_id SET NOT NULL;

-- Índice
CREATE INDEX IF NOT EXISTS idx_patients_organization_id ON patients(organization_id);

-- Tabela appointments
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Tornar organization_id obrigatório
ALTER TABLE appointments 
ALTER COLUMN organization_id SET NOT NULL;

-- Índices
CREATE INDEX IF NOT EXISTS idx_appointments_organization_id ON appointments(organization_id);

-- Tabela settings
ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Tornar organization_id obrigatório e único por organização
ALTER TABLE settings 
ALTER COLUMN organization_id SET NOT NULL;

-- Constraint: apenas um settings por organização
ALTER TABLE settings 
ADD CONSTRAINT settings_organization_unique UNIQUE(organization_id);

-- Índice
CREATE INDEX IF NOT EXISTS idx_settings_organization_id ON settings(organization_id);

-- 5. FUNÇÃO HELPER: Obter organization_id do usuário atual
CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID AS $$
  SELECT organization_id 
  FROM profiles 
  WHERE id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Comentário
COMMENT ON FUNCTION get_user_organization_id() IS 'Retorna o organization_id do usuário autenticado';

-- 6. FUNÇÃO: Criar slug a partir do nome (sem dependência de extensões)
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

-- Comentário
COMMENT ON FUNCTION generate_slug(TEXT) IS 'Gera slug URL-friendly a partir de um nome';

-- 7. SEED: Criar organização de demonstração
INSERT INTO organizations (name, slug, settings)
VALUES (
  'Clínica Demo',
  'clinica-demo',
  '{"theme": "light", "locale": "pt-BR"}'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- Nota: O primeiro usuário será criado via interface de cadastro

