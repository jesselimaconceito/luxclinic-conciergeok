-- Adicionar coluna support_whatsapp à tabela organizations
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS support_whatsapp TEXT;

-- Comentário descritivo
COMMENT ON COLUMN public.organizations.support_whatsapp IS 'Número de WhatsApp para suporte da organização (formato: 5511999999999)';

