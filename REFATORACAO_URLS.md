# ✅ Refatoração: URLs Centralizadas

## 📋 Resumo

Todas as URLs de API foram centralizadas em um arquivo de constantes, facilitando manutenção e configuração.

---

## 🔧 Mudanças Realizadas

### **1. Novo Arquivo de Constantes**

**Arquivo:** `src/lib/constants.ts`

```typescript
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
```

---

### **2. Variáveis de Ambiente Atualizadas**

**Arquivo:** `.env`

```env
VITE_SUPABASE_PROJECT_ID="usidtjpjymomofyqolwe"
VITE_SUPABASE_URL="https://usidtjpjymomofyqolwe.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGci..."
VITE_N8N_WEBHOOK_URL="https://webhook.n8nlabz.com.br/webhook"
```

**Nova Variável:**
- `VITE_N8N_WEBHOOK_URL` - Base URL para webhooks N8N

---

### **3. Arquivos Refatorados**

#### **A) `src/pages/Integrations.tsx`**

**Antes:**
```typescript
const response = await fetch("https://webhook.n8nlabz.com.br/webhook/criar-instancia-cliente", { ... });
```

**Depois:**
```typescript
import { N8N_ENDPOINTS } from "@/lib/constants";
const response = await fetch(N8N_ENDPOINTS.CRIAR_INSTANCIA, { ... });
```

**Endpoints Atualizados:**
- ✅ `CRIAR_INSTANCIA`
- ✅ `GERAR_QRCODE`
- ✅ `VERIFICAR_CONEXAO`
- ✅ `LISTAR_INSTANCIA`
- ✅ `APAGAR_INSTANCIA`

---

#### **B) `src/pages/Agenda.tsx`**

**Antes:**
```typescript
const response = await fetch('https://webhook.n8nlabz.com.br/webhook/labz-conferir-agenda', { ... });
```

**Depois:**
```typescript
import { N8N_ENDPOINTS } from "@/lib/constants";
const response = await fetch(N8N_ENDPOINTS.CONFERIR_AGENDA, { ... });
```

**Endpoints Atualizados:**
- ✅ `CONFERIR_AGENDA`
- ✅ `CRIAR_AGENDA`

---

#### **C) `src/pages/Conhecimento.tsx`**

**Antes:**
```typescript
const response = await fetch("https://webhook.n8nlabz.com.br/webhook/rag-cliente", { ... });
```

**Depois:**
```typescript
import { N8N_ENDPOINTS } from "@/lib/constants";
const response = await fetch(N8N_ENDPOINTS.RAG_CLIENTE, { ... });
```

**Endpoints Atualizados:**
- ✅ `RAG_CLIENTE`
- ✅ `RAG_DELETAR_UNICO`
- ✅ `RAG_DELETAR_TUDO`

---

#### **D) `src/pages/super-admin/OrganizationForm.tsx`**

**Antes:**
```typescript
const response = await fetch("https://webhook.n8nlabz.com.br/webhook/criacao-fluxo", { ... });
const response2 = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-organization`, { ... });
```

**Depois:**
```typescript
import { N8N_ENDPOINTS, SUPABASE_FUNCTIONS } from "@/lib/constants";
const response = await fetch(N8N_ENDPOINTS.CRIACAO_FLUXO, { ... });
const response2 = await fetch(SUPABASE_FUNCTIONS.CREATE_ORGANIZATION, { ... });
```

**Endpoints Atualizados:**
- ✅ `CRIACAO_FLUXO` (N8N)
- ✅ `CONFIGURAR_WEBHOOK` (N8N)
- ✅ `CREATE_ORGANIZATION` (Supabase)
- ✅ `MANAGE_USERS` (Supabase)

---

## 📊 Estatísticas

| Categoria | Quantidade |
|-----------|------------|
| **Arquivos Refatorados** | 4 |
| **Endpoints N8N** | 11 |
| **Endpoints Supabase** | 4 |
| **URLs Hardcoded Removidas** | 15 |
| **Novas Constantes** | 15 |

---

## ✅ Benefícios

### **1. Manutenção Facilitada**
- Alterar URL base em um único lugar
- Sem buscar em múltiplos arquivos

### **2. Configuração Flexível**
- URLs configuráveis via `.env`
- Diferentes ambientes (dev, staging, prod)

### **3. Intellisense Melhorado**
- TypeScript autocomplete
- Detecção de erros em tempo de escrita

### **4. Documentação Centralizada**
- Todos os endpoints em um lugar
- Fácil visualização de APIs usadas

### **5. Type Safety**
- `as const` garante tipos literais
- Previne erros de digitação

---

## 🚀 Como Usar

### **Importar Constantes:**
```typescript
import { N8N_ENDPOINTS, SUPABASE_FUNCTIONS } from "@/lib/constants";
```

### **Usar Endpoints N8N:**
```typescript
const response = await fetch(N8N_ENDPOINTS.CRIAR_INSTANCIA, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ ... }),
});
```

### **Usar Edge Functions Supabase:**
```typescript
const response = await fetch(SUPABASE_FUNCTIONS.CREATE_ORGANIZATION, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  },
  body: JSON.stringify({ ... }),
});
```

---

## 🔧 Configuração de Ambiente

### **Desenvolvimento Local:**
```env
VITE_N8N_WEBHOOK_URL="https://webhook.n8nlabz.com.br/webhook"
VITE_SUPABASE_URL="https://usidtjpjymomofyqolwe.supabase.co"
```

### **Staging (Exemplo):**
```env
VITE_N8N_WEBHOOK_URL="https://staging-webhook.n8nlabz.com.br/webhook"
VITE_SUPABASE_URL="https://staging-project.supabase.co"
```

### **Produção:**
```env
VITE_N8N_WEBHOOK_URL="https://api.n8nlabz.com.br/webhook"
VITE_SUPABASE_URL="https://prod-project.supabase.co"
```

---

## 📝 Endpoints Disponíveis

### **N8N Webhooks:**

#### **WhatsApp:**
- `N8N_ENDPOINTS.CRIAR_INSTANCIA` - Criar instância WhatsApp
- `N8N_ENDPOINTS.GERAR_QRCODE` - Gerar QR Code
- `N8N_ENDPOINTS.VERIFICAR_CONEXAO` - Verificar conexão
- `N8N_ENDPOINTS.LISTAR_INSTANCIA` - Listar detalhes
- `N8N_ENDPOINTS.APAGAR_INSTANCIA` - Deletar instância
- `N8N_ENDPOINTS.CONFIGURAR_WEBHOOK` - Configurar webhook

#### **Agenda:**
- `N8N_ENDPOINTS.CRIAR_AGENDA` - Criar agendamento
- `N8N_ENDPOINTS.CONFERIR_AGENDA` - Verificar disponibilidade

#### **Base de Conhecimento:**
- `N8N_ENDPOINTS.RAG_CLIENTE` - Processar PDF
- `N8N_ENDPOINTS.RAG_DELETAR_UNICO` - Deletar documento
- `N8N_ENDPOINTS.RAG_DELETAR_TUDO` - Deletar tudo

#### **Workflow:**
- `N8N_ENDPOINTS.CRIACAO_FLUXO` - Criar workflow

### **Supabase Edge Functions:**

- `SUPABASE_FUNCTIONS.CREATE_ORGANIZATION` - Criar organização
- `SUPABASE_FUNCTIONS.UPDATE_ORGANIZATION` - Atualizar organização
- `SUPABASE_FUNCTIONS.MANAGE_USERS` - Gerenciar usuários
- `SUPABASE_FUNCTIONS.GENERATE_EMAIL` - Gerar email com IA

---

## 🎯 Próximos Passos

1. ✅ URLs centralizadas em constantes
2. ✅ Variável de ambiente para N8N
3. ✅ Todos os arquivos refatorados
4. ⏭️ Adicionar testes para endpoints
5. ⏭️ Documentar contratos de API
6. ⏭️ Implementar retry logic
7. ⏭️ Adicionar timeout configurável

---

## 🔍 Verificação

Para verificar se todas as URLs foram atualizadas:

```bash
# Buscar URLs hardcoded (não deve retornar nada)
grep -r "webhook.n8nlabz.com.br" src/

# Verificar uso das constantes
grep -r "N8N_ENDPOINTS" src/
grep -r "SUPABASE_FUNCTIONS" src/
```

**Resultado Esperado:**
- ❌ Nenhuma URL hardcoded em `src/`
- ✅ 4 arquivos usando `N8N_ENDPOINTS`
- ✅ 1 arquivo usando `SUPABASE_FUNCTIONS`

---

## 📞 Suporte

Se tiver dúvidas sobre as constantes ou precisar adicionar novos endpoints:

1. Adicione ao `src/lib/constants.ts`
2. Use a constante no código
3. Documente no README

---

**Data:** 03/12/2025  
**Status:** ✅ Completo  
**Versão:** 1.0.0

