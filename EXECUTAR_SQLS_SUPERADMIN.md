# 📋 Executar SQLs - Super Admin System

## ⚠️ IMPORTANTE

Execute TODOS os SQLs abaixo **em ordem**, diretamente no **Supabase SQL Editor**.

---

## 1️⃣ Migration 007: Remover Policies Antigas

```sql
-- =====================================================
-- MIGRATION 007: Remover Policies Antigas
-- =====================================================
-- Remove policies antigas que permitem acesso total,
-- garantindo que apenas as policies multi-tenant sejam usadas

-- Remover policies antigas de patients
DROP POLICY IF EXISTS "Enable delete for all users" ON patients;
DROP POLICY IF EXISTS "Enable insert for all users" ON patients;
DROP POLICY IF EXISTS "Enable read access for all users" ON patients;
DROP POLICY IF EXISTS "Enable update for all users" ON patients;

-- Remover policies antigas de appointments
DROP POLICY IF EXISTS "Enable delete for all users" ON appointments;
DROP POLICY IF EXISTS "Enable insert for all users" ON appointments;
DROP POLICY IF EXISTS "Enable read access for all users" ON appointments;
DROP POLICY IF EXISTS "Enable update for all users" ON appointments;

-- Remover policies antigas de settings
DROP POLICY IF EXISTS "Enable insert for all users" ON settings;
DROP POLICY IF EXISTS "Enable read access for all users" ON settings;
DROP POLICY IF EXISTS "Enable update for all users" ON settings;

COMMENT ON TABLE patients IS 'Tabela de pacientes - acesso isolado por organization_id';
COMMENT ON TABLE appointments IS 'Tabela de compromissos - acesso isolado por organization_id';
COMMENT ON TABLE settings IS 'Tabela de configurações - acesso isolado por organization_id';
```

✅ **Resultado esperado**: "Query executed successfully"

---

## 2️⃣ Migration 008: Adicionar Super Admin

**COPIE TODO O SQL ABAIXO E EXECUTE DE UMA VEZ:**

```sql
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
DROP CONSTRAINT IF EXISTS profiles_super_admin_no_org_check;

ALTER TABLE profiles
ADD CONSTRAINT profiles_super_admin_no_org_check 
CHECK (
  (is_super_admin = true AND organization_id IS NULL) OR
  (is_super_admin = false AND organization_id IS NOT NULL)
);

COMMENT ON CONSTRAINT profiles_super_admin_no_org_check ON profiles IS 
'Super admins não devem ter organization_id, usuários normais devem ter';
```

✅ **Resultado esperado**: "Query executed successfully"

---

## 3️⃣ Criar Primeiro Super Admin

### Passo 1: Criar Usuário no Supabase Auth

1. Acesse **Supabase Dashboard** → **Authentication** → **Users**
2. Clique em **"Add User"** → **"Create new user"**
3. Preencha:
   - **Email**: `seu-email@example.com`
   - **Password**: `sua-senha-segura`
   - **Auto Confirm User**: ✅ MARQUE ESTA OPÇÃO
4. Clique em **"Create user"**
5. **COPIE O UUID** que aparece na coluna "id"

### Passo 2: Executar SQL

**IMPORTANTE**: Substitua os valores marcados antes de executar!

```sql
DO $$
DECLARE
  super_admin_id UUID := 'COLE-O-UUID-AQUI'; -- ⚠️ SUBSTITUIR
  super_admin_name TEXT := 'Seu Nome Completo'; -- ⚠️ SUBSTITUIR
BEGIN
  INSERT INTO profiles (
    id,
    organization_id,
    full_name,
    role,
    is_super_admin,
    is_active
  ) VALUES (
    super_admin_id,
    NULL,
    super_admin_name,
    'admin',
    true,
    true
  )
  ON CONFLICT (id) DO UPDATE 
  SET 
    is_super_admin = true,
    organization_id = NULL,
    full_name = EXCLUDED.full_name;

  RAISE NOTICE 'Super admin criado/atualizado com sucesso!';
END $$;
```

✅ **Resultado esperado**: "Query executed successfully" + mensagem de sucesso

### Passo 3: Verificar

```sql
SELECT id, full_name, is_super_admin, organization_id
FROM profiles
WHERE is_super_admin = true;
```

✅ **Resultado esperado**: 
- 1 linha retornada
- `is_super_admin` = `true`
- `organization_id` = `NULL`

---

## ✅ Checklist Final

- [ ] Migration 007 executada (policies antigas removidas)
- [ ] Migration 008 executada (super admin adicionado)
- [ ] Usuário criado no Supabase Auth
- [ ] UUID copiado
- [ ] SQL de seed executado com UUID correto
- [ ] Verificação executada com sucesso

---

## 🚀 Próximos Passos

1. Acesse seu sistema: `http://localhost:5173/login`
2. Faça login com o email e senha que você definiu
3. Você será redirecionado para `/super-admin/dashboard`
4. Crie sua primeira organização de teste!

---

## 📞 Suporte

Se encontrar algum erro, verifique:
1. Todos os SQLs foram executados na ordem correta?
2. O UUID foi colado corretamente?
3. O usuário foi criado com "Auto Confirm User" marcado?
4. Há algum erro no console do Supabase?

