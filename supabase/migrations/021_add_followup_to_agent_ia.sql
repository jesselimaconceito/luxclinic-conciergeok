-- Adicionar campos de Follow Up ao Agent IA
-- Cada follow up será armazenado em minutos no banco de dados

ALTER TABLE public.agent_ia_config
ADD COLUMN IF NOT EXISTS follow_up_1_minutes INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS follow_up_2_minutes INTEGER DEFAULT 1440,
ADD COLUMN IF NOT EXISTS follow_up_3_minutes INTEGER DEFAULT 4320;

COMMENT ON COLUMN public.agent_ia_config.follow_up_1_minutes IS 'Primeiro follow up em minutos (padrão: 60 min = 1 hora)';
COMMENT ON COLUMN public.agent_ia_config.follow_up_2_minutes IS 'Segundo follow up em minutos (padrão: 1440 min = 1 dia)';
COMMENT ON COLUMN public.agent_ia_config.follow_up_3_minutes IS 'Terceiro follow up em minutos (padrão: 4320 min = 3 dias)';

