-- Adicionar coluna openai_api_key à tabela global_settings
ALTER TABLE public.global_settings
ADD COLUMN IF NOT EXISTS openai_api_key TEXT;

-- Comentário descritivo
COMMENT ON COLUMN public.global_settings.openai_api_key IS 'Chave de API OpenAI global usada por todas as organizações';

