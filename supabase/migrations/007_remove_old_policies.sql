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

