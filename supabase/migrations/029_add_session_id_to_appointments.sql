-- Adicionar coluna session_id à tabela appointments
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS session_id TEXT;

-- Comentário descritivo
COMMENT ON COLUMN public.appointments.session_id IS 'ID da sessão/conversa associada ao agendamento (vínculo com sistema de chat/WhatsApp)';

-- Criar índice para melhorar performance de busca por session_id
CREATE INDEX IF NOT EXISTS idx_appointments_session_id 
ON public.appointments(session_id);

-- Criar índice composto para busca por organização + session_id
CREATE INDEX IF NOT EXISTS idx_appointments_org_session 
ON public.appointments(organization_id, session_id);

