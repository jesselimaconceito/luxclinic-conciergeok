# 🔐 Plano: Sistema Super Admin

## Arquitetura de Níveis

### 1. Super Admin (Você)
- Acesso total ao sistema
- Painel administrativo separado
- Pode criar/editar/deletar organizações
- Pode criar/resetar senhas de admins de organizações
- Dashboard com métricas globais
- Visualização de todas as organizações ativas

### 2. Organization Admin (Clínicas)
- Acesso ao painel da clínica (atual)
- Gestão de pacientes, agenda, CRM
- Configurações da própria organização
- No futuro: convidar médicos/assistentes

### 3. Doctors/Users (Futuro)
- Acesso aos dados da clínica
- Sem acesso a configurações administrativas

---

## Implementação

### 1. Estrutura de Dados

#### 1.1 Atualizar tabela `profiles`
```sql
ALTER TABLE profiles 
ADD COLUMN is_super_admin BOOLEAN DEFAULT false;

-- Índice para busca rápida
CREATE INDEX idx_profiles_super_admin ON profiles(is_super_admin) WHERE is_super_admin = true;
```

#### 1.2 Criar super admin inicial
```sql
-- Será criado via migration após primeiro cadastro
-- Email: admin@luxclinic.com (você define)
```

#### 1.3 RLS para Super Admin
```sql
-- Super admins podem ver TUDO
CREATE POLICY "Super admins can view all organizations"
ON organizations FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_super_admin = true
  )
);

-- Super admins podem modificar qualquer organização
CREATE POLICY "Super admins can manage all organizations"
ON organizations FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_super_admin = true
  )
);
```

### 2. Frontend

#### 2.1 Estrutura de Rotas
```
/
├── /login (público)
├── /register (público - para organizations)
├── /super-admin (protegido - apenas super admin)
│   ├── /super-admin/dashboard
│   ├── /super-admin/organizations
│   ├── /super-admin/organizations/new
│   ├── /super-admin/organizations/:id/edit
│   └── /super-admin/analytics
└── /app (protegido - organization users)
    ├── /app/dashboard
    ├── /app/agenda
    ├── /app/crm
    ├── /app/subscription
    └── /app/integrations
```

#### 2.2 Componentes de Proteção
- `SuperAdminRoute.tsx` - Verifica se é super admin
- `OrgRoute.tsx` - Verifica se pertence a uma organização
- Redirect automático baseado no role após login

#### 2.3 Páginas Super Admin

**Dashboard (`/super-admin/dashboard`)**
- Total de organizações ativas/inativas
- Total de usuários no sistema
- Receita total (futuro)
- Gráficos de crescimento
- Últimas organizações cadastradas

**Organizações (`/super-admin/organizations`)**
- Lista todas as organizações
- Filtros: ativas/inativas, data de criação
- Ações: editar, desativar, ver detalhes
- Botão: "Criar Nova Organização"

**Criar/Editar Organização (`/super-admin/organizations/new`)**
- Nome da organização
- Email do admin
- Senha inicial (gerada ou manual)
- Status (ativa/inativa)
- Configurações iniciais
- Botão: "Enviar convite por email" (futuro)

**Analytics (`/super-admin/analytics`)**
- Métricas detalhadas
- Uso por organização
- Logs de atividade (futuro)

#### 2.4 Layout Super Admin

Layout completamente diferente:
- Sidebar com logo "LuxClinic Admin"
- Menu: Dashboard, Organizações, Analytics, Configurações
- Header: Badge "Super Admin" + logout
- Tema diferenciado (ex: roxo/vermelho)

### 3. AuthContext Atualizado

```typescript
interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  organization: Organization | null;
  isSuperAdmin: boolean; // NOVO
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
}
```

### 4. Fluxo de Login

1. Usuário faz login
2. Sistema busca `profile` do usuário
3. Verifica `is_super_admin`:
   - **true**: Redireciona para `/super-admin/dashboard`
   - **false**: Redireciona para `/app/dashboard`

### 5. Migrations SQL

**007_add_super_admin.sql**
- Adicionar coluna `is_super_admin` em `profiles`
- Atualizar RLS policies
- Função helper `is_user_super_admin()`

**008_super_admin_seed.sql**
- Criar primeiro super admin (você)
- Email e senha que você definir

---

## Arquivos a Criar

### Backend (SQL)
- `supabase/migrations/007_add_super_admin.sql`
- `supabase/migrations/008_super_admin_seed.sql`

### Frontend - Super Admin
- `src/pages/super-admin/Dashboard.tsx`
- `src/pages/super-admin/Organizations.tsx`
- `src/pages/super-admin/OrganizationForm.tsx`
- `src/pages/super-admin/Analytics.tsx`
- `src/components/SuperAdminLayout.tsx`
- `src/components/SuperAdminRoute.tsx`

### Frontend - Auth
- `src/hooks/useSuperAdmin.ts`
- Atualizar `src/contexts/AuthContext.tsx`
- Atualizar `src/App.tsx` (novas rotas)

### Frontend - Organization
- Renomear rotas atuais para `/app/*`
- Criar `src/components/OrgRoute.tsx`

---

## Ordem de Implementação

1. ✅ Deletar policies antigas (já identificadas)
2. Criar migration 007 (super admin)
3. Atualizar types TypeScript
4. Atualizar AuthContext
5. Criar SuperAdminRoute
6. Criar SuperAdminLayout
7. Criar páginas super admin
8. Atualizar App.tsx com rotas
9. Criar seed para primeiro super admin
10. Testar fluxo completo

---

## Segurança

- Super admin não tem `organization_id`
- Super admin usa `is_super_admin = true` para bypass de RLS
- Verificação dupla: frontend (UI) + backend (RLS)
- Logs de todas as ações de super admin (futuro)

---

## Próximos Passos

Vou começar implementando:
1. Remover policies antigas
2. Criar migration 007 (super admin)
3. Estruturar frontend do painel super admin

