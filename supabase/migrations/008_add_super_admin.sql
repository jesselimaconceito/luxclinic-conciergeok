-- =====================================================
-- MIGRATION 008: Super Admin System
-- =====================================================

-- 1. ADICIONAR COLUNA is_super_admin
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;

COMMENT ON COLUMN profiles.is_super_admin IS 'Super admins têm acesso total ao sistema';

-- Índice para busca rápida de super admins
CREATE INDEX IF NOT EXISTS idx_profiles_super_admin 
ON profiles(is_super_admin) 
WHERE is_super_admin = true;

-- 2. FUNÇÃO HELPER: Verificar se usuário é super admin
CREATE OR REPLACE FUNCTION is_user_super_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT is_super_admin FROM profiles WHERE id = auth.uid()),
    false
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION is_user_super_admin() IS 'Retorna true se o usuário autenticado é super admin';

-- 3. POLICIES PARA SUPER ADMIN

-- Organizations: Super admins podem ver todas
DROP POLICY IF EXISTS "Super admins can view all organizations" ON organizations;
CREATE POLICY "Super admins can view all organizations"
ON organizations FOR SELECT
TO authenticated
USING (is_user_super_admin());

-- Organizations: Super admins podem inserir
DROP POLICY IF EXISTS "Super admins can insert organizations" ON organizations;
CREATE POLICY "Super admins can insert organizations"
ON organizations FOR INSERT
TO authenticated
WITH CHECK (is_user_super_admin());

-- Organizations: Super admins podem atualizar
DROP POLICY IF EXISTS "Super admins can update organizations" ON organizations;
CREATE POLICY "Super admins can update organizations"
ON organizations FOR UPDATE
TO authenticated
USING (is_user_super_admin());

-- Organizations: Super admins podem deletar
DROP POLICY IF EXISTS "Super admins can delete organizations" ON organizations;
CREATE POLICY "Super admins can delete organizations"
ON organizations FOR DELETE
TO authenticated
USING (is_user_super_admin());

-- Profiles: Super admins podem ver todos os perfis
DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;
CREATE POLICY "Super admins can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (is_user_super_admin());

-- Profiles: Super admins podem criar perfis em qualquer organização
DROP POLICY IF EXISTS "Super admins can insert profiles" ON profiles;
CREATE POLICY "Super admins can insert profiles"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (is_user_super_admin());

-- Profiles: Super admins podem atualizar qualquer perfil
DROP POLICY IF EXISTS "Super admins can update profiles" ON profiles;
CREATE POLICY "Super admins can update profiles"
ON profiles FOR UPDATE
TO authenticated
USING (is_user_super_admin());

-- Patients: Super admins podem ver todos
DROP POLICY IF EXISTS "Super admins can view all patients" ON patients;
CREATE POLICY "Super admins can view all patients"
ON patients FOR SELECT
TO authenticated
USING (is_user_super_admin());

-- Appointments: Super admins podem ver todos
DROP POLICY IF EXISTS "Super admins can view all appointments" ON appointments;
CREATE POLICY "Super admins can view all appointments"
ON appointments FOR SELECT
TO authenticated
USING (is_user_super_admin());

-- Settings: Super admins podem ver todas
DROP POLICY IF EXISTS "Super admins can view all settings" ON settings;
CREATE POLICY "Super admins can view all settings"
ON settings FOR SELECT
TO authenticated
USING (is_user_super_admin());

-- 4. ATUALIZAR organization_id PARA SER NULLABLE (super admins não têm org)
ALTER TABLE profiles 
ALTER COLUMN organization_id DROP NOT NULL;

COMMENT ON COLUMN profiles.organization_id IS 'Organization do usuário - NULL para super admins';

-- 5. CHECK CONSTRAINT: Super admin não pode ter organization_id
ALTER TABLE profiles
ADD CONSTRAINT profiles_super_admin_no_org_check 
CHECK (
  (is_super_admin = true AND organization_id IS NULL) OR
  (is_super_admin = false AND organization_id IS NOT NULL)
);

COMMENT ON CONSTRAINT profiles_super_admin_no_org_check ON profiles IS 
'Super admins não devem ter organization_id, usuários normais devem ter';

