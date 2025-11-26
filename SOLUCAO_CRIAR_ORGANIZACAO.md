# 🔧 Solução: Erro ao Criar Organização

## ❌ Problema

Erro ao tentar criar organização como super admin:
```
AuthApiError: User not allowed
```

## 🔍 Causa

O método `supabase.auth.admin.createUser()` só funciona com a **Service Role Key**, que não pode ser exposta no frontend por motivos de segurança.

## ✅ Solução Implementada

Criamos **Edge Functions** no Supabase que:
- Rodam no servidor (Deno)
- Têm acesso à Service Role Key
- Verificam se o usuário é super admin
- Criam usuários e organizações com segurança

---

## 📦 Arquivos Criados

### Edge Functions
1. `supabase/functions/create-organization/index.ts` - Criar organização + admin
2. `supabase/functions/update-organization/index.ts` - Atualizar organização

### Frontend Atualizado
- `src/pages/super-admin/OrganizationForm.tsx` - Agora chama as Edge Functions

---

## 🚀 Como Resolver

### Passo 1: Deploy das Edge Functions

Você tem 2 opções:

#### Opção A: Via CLI (Mais Fácil)

```bash
# 1. Instalar Supabase CLI
npm install -g supabase

# 2. Login
supabase login

# 3. Linkar projeto
supabase link --project-ref usidtjpjymomofyqolwe

# 4. Deploy
supabase functions deploy create-organization
supabase functions deploy update-organization
```

#### Opção B: Via Dashboard (Manual)

1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **Edge Functions**
3. Crie function `create-organization`:
   - Copie o código de `supabase/functions/create-organization/index.ts`
   - Cole no editor
   - Clique em "Deploy"
4. Repita para `update-organization`

---

### Passo 2: Testar

Após o deploy:

1. Recarregue a página do seu super admin dashboard
2. Vá em **Organizações** > **Nova Organização**
3. Preencha o formulário:
   - Nome: "Clínica Teste"
   - Admin: "Admin Teste"
   - Email: "admin@teste.com"
   - Senha: "teste123"
4. Clique em **"Criar Organização"**

Agora deve funcionar! 🎉

---

## 🔐 Como Funciona

### Fluxo Antigo (❌ Não Funciona)
```
Frontend → supabase.auth.admin.createUser()
          ↓
        ❌ ERRO: "User not allowed"
        (Anon Key não tem privilégios)
```

### Fluxo Novo (✅ Funciona)
```
Frontend → Edge Function (com Service Role Key)
          ↓
        1. Verifica se é super admin
        2. Cria usuário no Auth
        3. Cria organização
        4. Cria perfil
        5. Cria settings
          ↓
        ✅ Sucesso!
```

---

## 📋 Checklist

- [ ] Edge Functions deployadas no Supabase
- [ ] Testado criar organização no super admin
- [ ] Organização criada com sucesso
- [ ] Admin consegue fazer login

---

## 🐛 Troubleshooting

### "Function not found"
- Aguarde 1-2 minutos após o deploy
- Recarregue a página
- Verifique se o deploy foi bem-sucedido

### Ainda dá erro de permissão
- Verifique se você fez login como super admin
- Verifique no banco: `SELECT * FROM profiles WHERE is_super_admin = true`

### CORS error
- As functions já têm CORS configurado
- Limpe o cache do navegador

---

## 💡 Por Que Edge Functions?

**Segurança**: 
- Service Role Key nunca é exposta no frontend
- Verificação server-side de permissões

**Controle**:
- Validação centralizada
- Logs no servidor
- Rollback em caso de erro

**Escalabilidade**:
- Fácil adicionar validações
- Fácil integrar com webhooks
- Fácil adicionar envio de emails

---

Siga o arquivo **DEPLOY_EDGE_FUNCTIONS.md** para instruções detalhadas! 🚀

