-- =====================================================
-- MIGRATION 006: Enable Row Level Security (RLS)
-- =====================================================
-- Configurar políticas de segurança para isolamento de dados por organização

-- 1. HABILITAR RLS EM TODAS AS TABELAS

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 2. POLICIES PARA ORGANIZATIONS

-- Usuários podem ver apenas sua própria organização
CREATE POLICY "Users can view their organization"
  ON organizations FOR SELECT
  USING (id = get_user_organization_id());

-- Apenas admins podem atualizar
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

-- Usuários podem ver perfis da mesma organização
CREATE POLICY "Users can view profiles in their organization"
  ON profiles FOR SELECT
  USING (organization_id = get_user_organization_id());

-- Usuários podem ver seu próprio perfil
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

-- Usuários podem atualizar seu próprio perfil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- Sistema pode inserir perfis (usado no cadastro)
CREATE POLICY "System can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- 4. POLICIES PARA PATIENTS

-- Ver apenas pacientes da mesma organização
CREATE POLICY "Users can view patients in their organization"
  ON patients FOR SELECT
  USING (organization_id = get_user_organization_id());

-- Inserir pacientes na própria organização
CREATE POLICY "Users can insert patients in their organization"
  ON patients FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id());

-- Atualizar pacientes da própria organização
CREATE POLICY "Users can update patients in their organization"
  ON patients FOR UPDATE
  USING (organization_id = get_user_organization_id());

-- Deletar pacientes da própria organização
CREATE POLICY "Users can delete patients in their organization"
  ON patients FOR DELETE
  USING (organization_id = get_user_organization_id());

-- 5. POLICIES PARA APPOINTMENTS

-- Ver apenas compromissos da mesma organização
CREATE POLICY "Users can view appointments in their organization"
  ON appointments FOR SELECT
  USING (organization_id = get_user_organization_id());

-- Inserir compromissos na própria organização
CREATE POLICY "Users can insert appointments in their organization"
  ON appointments FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id());

-- Atualizar compromissos da própria organização
CREATE POLICY "Users can update appointments in their organization"
  ON appointments FOR UPDATE
  USING (organization_id = get_user_organization_id());

-- Deletar compromissos da própria organização
CREATE POLICY "Users can delete appointments in their organization"
  ON appointments FOR DELETE
  USING (organization_id = get_user_organization_id());

-- 6. POLICIES PARA SETTINGS

-- Ver configurações da própria organização
CREATE POLICY "Users can view their organization settings"
  ON settings FOR SELECT
  USING (organization_id = get_user_organization_id());

-- Apenas admins podem atualizar
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

-- Inserir settings (usado no cadastro da organização)
CREATE POLICY "System can insert settings"
  ON settings FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id());

-- 7. GRANT PERMISSIONS

-- Dar permissões para usuários autenticados
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Nota: RLS agora protege todos os dados por organização
-- Cada usuário só consegue acessar dados de sua própria organização

