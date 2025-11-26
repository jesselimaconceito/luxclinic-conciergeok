# 🗄️ Setup do Supabase - LuxClinic

## ✅ Configuração Concluída

### 1. Cliente Supabase Instalado
```bash
npm install @supabase/supabase-js
```

### 2. Variáveis de Ambiente (.env)
```env
VITE_SUPABASE_PROJECT_ID="usidtjpjymomofyqolwe"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGc..."
VITE_SUPABASE_URL="https://usidtjpjymomofyqolwe.supabase.co"
```

### 3. Estrutura Criada

#### Arquivos:
- `src/lib/supabase.ts` - Cliente Supabase configurado
- `src/types/database.ts` - Tipos TypeScript das tabelas
- `src/hooks/useAppointments.ts` - Hooks para compromissos
- `src/hooks/usePatients.ts` - Hooks para pacientes
- `supabase/migrations/001_initial_schema.sql` - Schema do banco
- `supabase/seed.sql` - Dados de exemplo

## 📋 Próximos Passos

### 1. Criar as Tabelas no Supabase

**Opção A: Via Dashboard Supabase**
1. Acesse: https://supabase.com/dashboard/project/usidtjpjymomofyqolwe
2. Vá em **SQL Editor**
3. Copie e execute o conteúdo de `supabase/migrations/001_initial_schema.sql`

**Opção B: Via CLI Supabase**
```bash
# Se tiver o Supabase CLI instalado
supabase db push
```

### 2. Popular com Dados de Exemplo (Opcional)

No SQL Editor do Supabase, execute:
```bash
supabase/seed.sql
```

### 3. Verificar Tabelas Criadas

No dashboard, vá em **Table Editor** e verifique:
- ✅ `patients` (pacientes)
- ✅ `appointments` (compromissos)
- ✅ `settings` (configurações)

## 🗃️ Estrutura das Tabelas

### `patients`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | ID único |
| created_at | TIMESTAMP | Data de criação |
| name | TEXT | Nome do paciente |
| email | TEXT | Email (único) |
| phone | TEXT | Telefone |
| status | TEXT | 'active' ou 'inactive' |
| last_visit | TIMESTAMP | Última visita |
| total_visits | INTEGER | Total de visitas |

### `appointments`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | ID único |
| created_at | TIMESTAMP | Data de criação |
| date | DATE | Data do compromisso |
| time | TEXT | Hora (ex: "09:00") |
| patient_id | UUID | ID do paciente |
| patient_name | TEXT | Nome do paciente |
| type | TEXT | Tipo (Consulta, Tratamento, etc) |
| status | TEXT | confirmed/pending/completed/cancelled |
| notes | TEXT | Observações |

### `settings`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | ID único |
| created_at | TIMESTAMP | Data de criação |
| clinic_name | TEXT | Nome da clínica |
| doctor_name | TEXT | Nome do médico |
| subscription_plan | TEXT | Plano atual |
| subscription_renews_at | TIMESTAMP | Data de renovação |

## 🔧 Hooks Disponíveis

### Compromissos (useAppointments)
```typescript
import { useAppointments, useCreateAppointment } from '@/hooks/useAppointments';

// Listar todos os compromissos
const { data: appointments } = useAppointments();

// Compromissos de uma data específica
const { data: appointments } = useAppointments(new Date());

// Criar compromisso
const createAppointment = useCreateAppointment();
createAppointment.mutate({
  date: '2024-11-25',
  time: '10:00',
  patient_id: 'uuid-aqui',
  patient_name: 'João Silva',
  type: 'Consulta',
  status: 'confirmed'
});
```

### Pacientes (usePatients)
```typescript
import { usePatients, useCreatePatient } from '@/hooks/usePatients';

// Listar todos os pacientes
const { data: patients } = usePatients();

// Criar paciente
const createPatient = useCreatePatient();
createPatient.mutate({
  name: 'João Silva',
  email: 'joao@email.com',
  phone: '+351 912 345 678',
  status: 'active'
});
```

## 🔐 Row Level Security (RLS)

As políticas estão configuradas para **permitir acesso público** por enquanto. 

**⚠️ IMPORTANTE:** Em produção, configure RLS apropriado baseado em autenticação de usuários.

## ✅ Checklist de Integração

- [x] Cliente Supabase instalado
- [x] Tipos TypeScript criados
- [x] Hooks personalizados criados
- [x] Schema SQL criado
- [ ] **Executar migration no Supabase**
- [ ] Integrar na página Agenda
- [ ] Integrar na página CRM
- [ ] Integrar no Dashboard
- [ ] Testar CRUD completo

## 🚀 Próxima Etapa

Execute a migration SQL no Supabase e me avise para eu integrar os hooks nas páginas!

