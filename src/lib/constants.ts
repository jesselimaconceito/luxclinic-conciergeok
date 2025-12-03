// URLs de API
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
export const N8N_WEBHOOK_BASE_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://webhook.n8nlabz.com.br/webhook';

// Endpoints N8N
export const N8N_ENDPOINTS = {
  // WhatsApp
  CRIAR_INSTANCIA: `${N8N_WEBHOOK_BASE_URL}/criar-instancia-cliente`,
  GERAR_QRCODE: `${N8N_WEBHOOK_BASE_URL}/gerar-qrcode`,
  VERIFICAR_CONEXAO: `${N8N_WEBHOOK_BASE_URL}/verificar-conexao`,
  LISTAR_INSTANCIA: `${N8N_WEBHOOK_BASE_URL}/listar-instancia`,
  APAGAR_INSTANCIA: `${N8N_WEBHOOK_BASE_URL}/apagar-instancia`,
  CONFIGURAR_WEBHOOK: `${N8N_WEBHOOK_BASE_URL}/configurar-webhook`,
  
  // Agenda
  CRIAR_AGENDA: `${N8N_WEBHOOK_BASE_URL}/labz-criar-agenda`,
  CONFERIR_AGENDA: `${N8N_WEBHOOK_BASE_URL}/labz-conferir-agenda`,
  
  // RAG/Conhecimento
  RAG_CLIENTE: `${N8N_WEBHOOK_BASE_URL}/rag-cliente`,
  RAG_DELETAR_UNICO: `${N8N_WEBHOOK_BASE_URL}/rag-deletar-unico`,
  RAG_DELETAR_TUDO: `${N8N_WEBHOOK_BASE_URL}/rag-deletar-tudo`,
  
  // Workflow
  CRIACAO_FLUXO: `${N8N_WEBHOOK_BASE_URL}/criacao-fluxo`,
} as const;

// Endpoints Supabase Edge Functions
export const SUPABASE_FUNCTIONS = {
  CREATE_ORGANIZATION: `${SUPABASE_URL}/functions/v1/create-organization`,
  UPDATE_ORGANIZATION: `${SUPABASE_URL}/functions/v1/update-organization`,
  MANAGE_USERS: `${SUPABASE_URL}/functions/v1/manage-organization-users`,
  GENERATE_EMAIL: `${SUPABASE_URL}/functions/v1/generate-email`,
} as const;

