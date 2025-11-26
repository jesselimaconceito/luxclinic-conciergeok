-- =====================================================
-- MIGRATION 009: Criar Primeiro Super Admin
-- =====================================================
-- IMPORTANTE: Você precisa substituir os valores abaixo
-- com suas credenciais desejadas antes de executar

-- ⚠️ INSTRUÇÕES:
-- 1. Primeiro cadastre o usuário manualmente via Supabase Dashboard:
--    - Vá em Authentication > Users > "Add User"
--    - Email: [SEU EMAIL AQUI]
--    - Password: [SUA SENHA AQUI]
--    - Copie o UUID gerado
--
-- 2. Cole o UUID abaixo e execute este SQL:

DO $$
DECLARE
  super_admin_id UUID := 'COLE-O-UUID-DO-USUARIO-AQUI'; -- ⚠️ SUBSTITUIR
  super_admin_name TEXT := 'Super Admin'; -- ⚠️ SUBSTITUIR com seu nome
BEGIN
  -- Inserir profile de super admin
  INSERT INTO profiles (
    id,
    organization_id,
    full_name,
    role,
    is_super_admin,
    is_active
  ) VALUES (
    super_admin_id,
    NULL, -- Super admin não tem organização
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

-- Verificar
SELECT id, full_name, is_super_admin, organization_id
FROM profiles
WHERE is_super_admin = true;

