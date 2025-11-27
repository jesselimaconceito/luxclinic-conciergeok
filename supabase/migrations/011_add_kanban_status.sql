-- Migration: Adicionar coluna kanban_status na tabela patients
-- Descrição: Permite rastrear a posição do lead/paciente no funil de vendas do Kanban

-- Adiciona a coluna kanban_status com os 6 estados possíveis
ALTER TABLE public.patients
ADD COLUMN kanban_status TEXT DEFAULT 'novo_contato' CHECK (
  kanban_status IN (
    'novo_contato',
    'qualificado',
    'em_atendimento',
    'agendado',
    'aguardando_confirmacao',
    'concluido'
  )
);

-- Adiciona comentário explicativo na coluna
COMMENT ON COLUMN public.patients.kanban_status IS 'Status do lead no funil de vendas do Kanban';

-- Cria índice para melhorar performance das consultas filtradas por kanban_status
CREATE INDEX idx_patients_kanban_status ON public.patients(kanban_status);

-- Cria índice composto para filtros por organization e kanban_status
CREATE INDEX idx_patients_org_kanban_status ON public.patients(organization_id, kanban_status);

