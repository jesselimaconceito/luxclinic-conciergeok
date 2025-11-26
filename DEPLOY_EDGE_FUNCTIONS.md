# 🚀 Deploy Edge Functions - Instruções

## 📋 Edge Functions Criadas

Criamos 2 Edge Functions para gerenciar organizações com privilégios de admin:

1. **create-organization** - Criar nova organização + admin
2. **update-organization** - Atualizar organização existente

---

## 🛠️ Como Fazer o Deploy

### Opção 1: Via Supabase CLI (Recomendado)

#### Passo 1: Instalar Supabase CLI

```bash
# Windows (via NPM)
npm install -g supabase

# Ou via Scoop
scoop install supabase
```

#### Passo 2: Login no Supabase

```bash
supabase login
```

#### Passo 3: Linkar ao Projeto

```bash
# Substitua YOUR_PROJECT_ID pelo ID do seu projeto
supabase link --project-ref usidtjpjymomofyqolwe
```

#### Passo 4: Deploy das Functions

```bash
# Deploy de todas as functions
supabase functions deploy

# Ou deploy individual
supabase functions deploy create-organization
supabase functions deploy update-organization
```

---

### Opção 2: Via Supabase Dashboard (Manual)

Se você não conseguir usar o CLI, pode fazer o deploy manual:

#### Passo 1: Acessar Edge Functions

1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Edge Functions** no menu lateral

#### Passo 2: Criar Function: create-organization

1. Clique em **"Create a new function"**
2. Nome: `create-organization`
3. Cole o código do arquivo `supabase/functions/create-organization/index.ts`
4. Clique em **"Deploy function"**

#### Passo 3: Criar Function: update-organization

1. Clique em **"Create a new function"**
2. Nome: `update-organization`
3. Cole o código do arquivo `supabase/functions/update-organization/index.ts`
4. Clique em **"Deploy function"**

---

## ✅ Verificar Deploy

Após o deploy, verifique:

1. Acesse **Edge Functions** no Supabase Dashboard
2. Você deve ver 2 functions:
   - ✅ `create-organization` - Status: Active
   - ✅ `update-organization` - Status: Active

---

## 🧪 Testar as Functions

### Teste via Dashboard

1. Vá em **Edge Functions** > **create-organization**
2. Clique em **"Test function"**
3. Cole este JSON de teste:

```json
{
  "organizationName": "Clínica Teste",
  "adminEmail": "teste@clinica.com",
  "adminPassword": "senha123",
  "adminFullName": "Admin Teste",
  "isActive": true
}
```

4. Adicione o header de autorização (use seu token de super admin)
5. Clique em **"Run"**

---

## 🔧 Troubleshooting

### "Function not found"

- Verifique se fez o deploy corretamente
- Aguarde 1-2 minutos após o deploy
- Recarregue a página da aplicação

### "User not allowed" ainda aparece

- Verifique se as functions foram deployadas
- Verifique se a URL no código está correta: `VITE_SUPABASE_URL`
- Limpe o cache do navegador

### "CORS error"

- As functions já incluem headers CORS
- Se persistir, verifique se o domínio está correto

---

## 📝 URLs das Functions

Após o deploy, as functions estarão disponíveis em:

```
https://usidtjpjymomofyqolwe.supabase.co/functions/v1/create-organization
https://usidtjpjymomofyqolwe.supabase.co/functions/v1/update-organization
```

---

## 🔐 Segurança

✅ As Edge Functions verificam:
- Se o usuário está autenticado
- Se o usuário é super admin (`is_super_admin = true`)
- Validam os dados antes de criar

✅ As Edge Functions usam Service Role Key:
- Permite criar usuários no Auth
- Permite operações administrativas
- Não expõe a key ao frontend

---

## 📦 Próximos Passos

Após fazer o deploy:

1. ✅ Deploy das Edge Functions concluído
2. 🧪 Teste criando uma organização no super admin
3. 🎉 Sistema funcionando completamente!

---

## 💡 Comandos Úteis

```bash
# Ver logs da function
supabase functions logs create-organization

# Executar function localmente (desenvolvimento)
supabase functions serve create-organization

# Listar todas as functions
supabase functions list

# Deletar uma function
supabase functions delete create-organization
```

---

## 🆘 Precisa de Ajuda?

Se encontrar problemas:

1. Verifique os logs no Supabase Dashboard
2. Teste as functions via Dashboard primeiro
3. Verifique se a Service Role Key está configurada
4. Verifique se as variáveis de ambiente estão corretas no `.env`

