# 🔐 Setup Super Admin - Instruções

## Ordem de Execução dos SQLs

Execute os SQLs nesta ordem no **Supabase SQL Editor**:

### 1️⃣ Remover Policies Antigas
```sql
-- 007_remove_old_policies.sql
```
Este SQL remove as policies antigas que permitiam acesso total a todos os dados, garantindo que apenas as policies multi-tenant funcionem.

### 2️⃣ Adicionar Sistema Super Admin
```sql
-- 008_add_super_admin.sql
```
Este SQL:
- Adiciona coluna `is_super_admin` em `profiles`
- Cria função helper `is_user_super_admin()`
- Cria policies para super admins
- Torna `organization_id` nullable para super admins

### 3️⃣ Criar Primeiro Super Admin

**ATENÇÃO**: Você precisa criar o usuário manualmente primeiro!

#### Passo A: Criar Usuário no Supabase Auth

1. Acesse seu projeto Supabase
2. Vá em **Authentication** > **Users**
3. Clique em **"Add User"** > **"Create new user"**
4. Preencha:
   - **Email**: seu-email@example.com (escolha um email que você controla)
   - **Password**: uma senha segura (mínimo 6 caracteres)
   - **Auto Confirm User**: ✅ Marque esta opção
5. Clique em **"Create user"**
6. **COPIE O UUID** gerado para este usuário (aparece na coluna "id")

#### Passo B: Executar SQL de Seed

1. Abra o arquivo `supabase/migrations/009_create_super_admin_seed.sql`
2. **Substitua** as seguintes linhas:
   ```sql
   super_admin_id UUID := 'COLE-O-UUID-DO-USUARIO-AQUI'; -- ⚠️ SUBSTITUIR
   super_admin_name TEXT := 'Super Admin'; -- ⚠️ SUBSTITUIR com seu nome
   ```
   Por:
   ```sql
   super_admin_id UUID := 'uuid-copiado-do-passo-a';
   super_admin_name TEXT := 'Seu Nome Completo';
   ```
3. Execute o SQL modificado no **Supabase SQL Editor**

#### Verificação

Execute este SQL para verificar:
```sql
SELECT id, full_name, is_super_admin, organization_id
FROM profiles
WHERE is_super_admin = true;
```

Você deve ver seu perfil com:
- `is_super_admin` = `true`
- `organization_id` = `NULL`

---

## 🚀 Primeiro Login como Super Admin

1. Acesse sua aplicação
2. Vá para `/login`
3. Faça login com:
   - Email: o email que você cadastrou
   - Senha: a senha que você definiu
4. Você será redirecionado para `/super-admin/dashboard`

---

## ✅ Checklist Completo

- [ ] Executar `007_remove_old_policies.sql`
- [ ] Executar `008_add_super_admin.sql`
- [ ] Criar usuário manualmente no Supabase Auth
- [ ] Copiar UUID do usuário criado
- [ ] Modificar e executar `009_create_super_admin_seed.sql`
- [ ] Verificar que o profile foi criado com `is_super_admin = true`
- [ ] Fazer primeiro login no sistema

---

## 📋 Funcionalidades do Super Admin

Após login, você terá acesso a:

### Dashboard Super Admin (`/super-admin/dashboard`)
- Total de organizações (ativas/inativas)
- Total de usuários no sistema
- Total de pacientes
- Total de compromissos
- Últimas organizações cadastradas

### Gerenciar Organizações (`/super-admin/organizations`)
- Visualizar todas as organizações
- Criar nova organização + admin
- Editar organizações existentes
- Ativar/Desativar organizações
- Buscar organizações

### Criar Organização (`/super-admin/organizations/new`)
Ao criar uma organização, você define:
- Nome da organização
- Nome completo do administrador
- Email do administrador
- Senha inicial do administrador
- Status (ativa/inativa)

O sistema automaticamente:
- Cria o usuário no Supabase Auth
- Cria a organização
- Vincula o admin à organização
- Cria as settings padrão

---

## 🔒 Níveis de Acesso

### Super Admin
- Acesso ao painel `/super-admin/*`
- Pode gerenciar todas as organizações
- Pode criar/editar/desativar organizações
- Vê todas as estatísticas do sistema
- Não possui `organization_id` (é `NULL`)

### Organization Admin
- Acesso ao painel `/app/*`
- Gerencia apenas sua organização
- Vê apenas seus pacientes/agendamentos
- Possui `organization_id` definido

---

## 🛡️ Segurança

- Super admin não tem `organization_id`
- Super admin bypass RLS via `is_user_super_admin()` function
- Verificação dupla: frontend (rotas) + backend (policies)
- Usuários normais nunca veem dados de outras organizações
- RLS garante isolamento total dos dados

---

## 🐛 Troubleshooting

### "Não consigo acessar o painel super admin"

Verifique:
1. O campo `is_super_admin` está como `true` no banco?
   ```sql
   SELECT * FROM profiles WHERE id = 'seu-user-id';
   ```
2. O campo `organization_id` está como `NULL`?
3. Você está fazendo login com o email correto?

### "Erro ao criar organização"

Verifique:
1. As policies de super admin foram criadas?
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'organizations';
   ```
2. O email do admin já existe no sistema?
3. O slug da organização é único?

---

## 📞 Próximos Passos

1. Execute todos os SQLs conforme instruções acima
2. Crie seu primeiro super admin
3. Faça login como super admin
4. Crie sua primeira organização de teste
5. Faça logout e teste o login como admin da organização

