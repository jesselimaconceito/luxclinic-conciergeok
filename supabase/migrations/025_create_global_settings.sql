-- Remover coluna support_whatsapp da tabela organizations (foi adicionada por engano)
ALTER TABLE public.organizations
DROP COLUMN IF EXISTS support_whatsapp;

-- Criar tabela de configurações globais
CREATE TABLE IF NOT EXISTS public.global_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    support_whatsapp TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Comentário
COMMENT ON TABLE public.global_settings IS 'Configurações globais do sistema (aplicam-se a todas as organizações)';
COMMENT ON COLUMN public.global_settings.support_whatsapp IS 'Número de WhatsApp para suporte global (formato: 5511999999999)';

-- Inserir registro inicial vazio
INSERT INTO public.global_settings (id) 
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- RLS
ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Todos podem ler
CREATE POLICY "Anyone can read global settings"
ON public.global_settings FOR SELECT
USING (true);

-- Policy: Apenas super admins podem atualizar
CREATE POLICY "Only super admins can update global settings"
ON public.global_settings FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_super_admin = true
  )
);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_global_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_global_settings_timestamp
BEFORE UPDATE ON public.global_settings
FOR EACH ROW
EXECUTE FUNCTION update_global_settings_updated_at();

