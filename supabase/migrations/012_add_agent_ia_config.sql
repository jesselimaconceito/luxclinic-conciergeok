-- Migration: Adicionar tabela de configurações do Agent IA
-- Descrição: Armazena configurações personalizadas do Agent IA por organização

-- Cria a tabela de configurações do Agent IA
CREATE TABLE public.agent_ia_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Configurações do Agent
  agent_name TEXT NOT NULL DEFAULT 'Assistente Virtual',
  personality TEXT NOT NULL DEFAULT 'profissional',
  pause_duration INTEGER NOT NULL DEFAULT 30, -- tempo em minutos
  greeting_message TEXT NOT NULL DEFAULT 'Olá! Sou o assistente virtual da clínica. Como posso ajudá-lo hoje?',
  closing_message TEXT NOT NULL DEFAULT 'Foi um prazer atendê-lo! Se precisar de algo mais, estou à disposição.',
  
  -- Garante apenas uma configuração por organização
  UNIQUE(organization_id)
);

-- Adiciona comentários
COMMENT ON TABLE public.agent_ia_config IS 'Configurações personalizadas do Agent IA por organização';
COMMENT ON COLUMN public.agent_ia_config.agent_name IS 'Nome personalizado do agent';
COMMENT ON COLUMN public.agent_ia_config.personality IS 'Personalidade do agent: profissional, amigável, formal, descontraído';
COMMENT ON COLUMN public.agent_ia_config.pause_duration IS 'Tempo em minutos que o agent pausa quando atendente humano assume';
COMMENT ON COLUMN public.agent_ia_config.greeting_message IS 'Mensagem de saudação inicial';
COMMENT ON COLUMN public.agent_ia_config.closing_message IS 'Mensagem de finalização do atendimento';

-- Habilita RLS
ALTER TABLE public.agent_ia_config ENABLE ROW LEVEL SECURITY;

-- Política de SELECT: usuários podem ver apenas configurações da sua organização
CREATE POLICY "Users can view their organization agent config"
  ON public.agent_ia_config
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Política de INSERT: usuários podem criar configurações para sua organização
CREATE POLICY "Users can create their organization agent config"
  ON public.agent_ia_config
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Política de UPDATE: usuários podem atualizar configurações da sua organização
CREATE POLICY "Users can update their organization agent config"
  ON public.agent_ia_config
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Política de DELETE: usuários podem deletar configurações da sua organização
CREATE POLICY "Users can delete their organization agent config"
  ON public.agent_ia_config
  FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Super admins têm acesso total
CREATE POLICY "Super admins have full access to agent config"
  ON public.agent_ia_config
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );

-- Índice para performance
CREATE INDEX idx_agent_ia_config_organization ON public.agent_ia_config(organization_id);

-- Função para atualizar o updated_at automaticamente
CREATE OR REPLACE FUNCTION update_agent_ia_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_agent_ia_config_updated_at
  BEFORE UPDATE ON public.agent_ia_config
  FOR EACH ROW
  EXECUTE FUNCTION update_agent_ia_config_updated_at();

