-- Adicionar coluna resumo à tabela patients
ALTER TABLE public.patients
ADD COLUMN IF NOT EXISTS resumo TEXT;

-- Comentário descritivo
COMMENT ON COLUMN public.patients.resumo IS 'Resumo da conversa/histórico do paciente gerado automaticamente';

