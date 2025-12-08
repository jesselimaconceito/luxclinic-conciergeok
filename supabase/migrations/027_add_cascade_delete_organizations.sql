-- Adicionar CASCADE DELETE para todas as tabelas relacionadas a organizations

-- 1. Tabela profiles
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_organization_id_fkey;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_organization_id_fkey
FOREIGN KEY (organization_id)
REFERENCES public.organizations(id)
ON DELETE CASCADE;

-- 2. Tabela patients
ALTER TABLE public.patients
DROP CONSTRAINT IF EXISTS patients_organization_id_fkey;

ALTER TABLE public.patients
ADD CONSTRAINT patients_organization_id_fkey
FOREIGN KEY (organization_id)
REFERENCES public.organizations(id)
ON DELETE CASCADE;

-- 3. Tabela appointments
ALTER TABLE public.appointments
DROP CONSTRAINT IF EXISTS appointments_organization_id_fkey;

ALTER TABLE public.appointments
ADD CONSTRAINT appointments_organization_id_fkey
FOREIGN KEY (organization_id)
REFERENCES public.organizations(id)
ON DELETE CASCADE;

-- 4. Tabela settings
ALTER TABLE public.settings
DROP CONSTRAINT IF EXISTS settings_organization_id_fkey;

ALTER TABLE public.settings
ADD CONSTRAINT settings_organization_id_fkey
FOREIGN KEY (organization_id)
REFERENCES public.organizations(id)
ON DELETE CASCADE;

-- 5. Tabela agent_ia_config
ALTER TABLE public.agent_ia_config
DROP CONSTRAINT IF EXISTS agent_ia_config_organization_id_fkey;

ALTER TABLE public.agent_ia_config
ADD CONSTRAINT agent_ia_config_organization_id_fkey
FOREIGN KEY (organization_id)
REFERENCES public.organizations(id)
ON DELETE CASCADE;

-- 6. Tabela whatsapp_instances
ALTER TABLE public.whatsapp_instances
DROP CONSTRAINT IF EXISTS whatsapp_instances_organization_id_fkey;

ALTER TABLE public.whatsapp_instances
ADD CONSTRAINT whatsapp_instances_organization_id_fkey
FOREIGN KEY (organization_id)
REFERENCES public.organizations(id)
ON DELETE CASCADE;

-- 7. Tabela work_schedules
ALTER TABLE public.work_schedules
DROP CONSTRAINT IF EXISTS work_schedules_organization_id_fkey;

ALTER TABLE public.work_schedules
ADD CONSTRAINT work_schedules_organization_id_fkey
FOREIGN KEY (organization_id)
REFERENCES public.organizations(id)
ON DELETE CASCADE;

-- Comentário
COMMENT ON CONSTRAINT profiles_organization_id_fkey ON public.profiles IS 'Cascade delete: ao excluir organização, exclui todos os perfis';
COMMENT ON CONSTRAINT patients_organization_id_fkey ON public.patients IS 'Cascade delete: ao excluir organização, exclui todos os pacientes';
COMMENT ON CONSTRAINT appointments_organization_id_fkey ON public.appointments IS 'Cascade delete: ao excluir organização, exclui todos os compromissos';
COMMENT ON CONSTRAINT settings_organization_id_fkey ON public.settings IS 'Cascade delete: ao excluir organização, exclui todas as configurações';
COMMENT ON CONSTRAINT agent_ia_config_organization_id_fkey ON public.agent_ia_config IS 'Cascade delete: ao excluir organização, exclui config do agent';
COMMENT ON CONSTRAINT whatsapp_instances_organization_id_fkey ON public.whatsapp_instances IS 'Cascade delete: ao excluir organização, exclui instâncias WhatsApp';
COMMENT ON CONSTRAINT work_schedules_organization_id_fkey ON public.work_schedules IS 'Cascade delete: ao excluir organização, exclui horários de trabalho';

