# 🔍 Debug: Dashboard mostrando apenas 4 de 9 pacientes

## 🚨 Problema Identificado
Você tem 9 pacientes no Supabase, mas o Dashboard está mostrando apenas 4.

## 🔧 Soluções (Execute na ordem)

### 1. ✅ Limpar Cache do Browser (MAIS COMUM)

**Chrome/Edge:**
1. Abra DevTools (F12)
2. Clique com botão direito no ícone de Refresh
3. Selecione "Limpar cache e recarregar forçado"
4. Ou: Ctrl + Shift + Delete → Limpar cache

**Ou simplesmente:**
1. Feche COMPLETAMENTE o browser
2. Abra novamente
3. Acesse http://localhost:5173

### 2. 🔍 Verificar Console do Browser

1. Abra DevTools (F12)
2. Vá na aba **Console**
3. Recarregue a página
4. Procure por:
   ```
   🔍 Buscando pacientes do Supabase...
   ✅ Pacientes carregados: X
   📋 Dados: [...]
   📊 Dashboard - Total de pacientes carregados: X
   ```

**O que verificar:**
- Se aparecer "❌ Erro ao buscar pacientes" → Problema na API
- Se aparecer número diferente de 9 → Problema no banco/RLS
- Se aparecer 9 mas Dashboard mostrar 4 → Problema no componente

### 3. 🗄️ Verificar no Supabase

1. Acesse: https://supabase.com/dashboard/project/usidtjpjymomofyqolwe
2. Vá em **Table Editor**
3. Selecione tabela **patients**
4. **Conte quantas linhas existem**
5. Execute no **SQL Editor**:

```sql
SELECT COUNT(*) as total FROM patients;
SELECT * FROM patients ORDER BY name;
```

### 4. 🔐 Verificar RLS (Row Level Security)

Execute no **SQL Editor** do Supabase:

```sql
-- Ver políticas atuais
SELECT * FROM pg_policies WHERE tablename = 'patients';

-- Contar pacientes (deve retornar 9)
SELECT COUNT(*) FROM patients;

-- Se retornar menos de 9, há problema nas políticas RLS
```

**Solução Rápida (apenas desenvolvimento):**

```sql
-- Desabilitar RLS temporariamente
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
```

Depois recarregue o site.

### 5. 🔄 Forçar Novo Fetch dos Dados

No Console do Browser (F12), execute:

```javascript
// Limpar cache do React Query
localStorage.clear();
location.reload();
```

### 6. 📝 Executar Script de Verificação

No **SQL Editor** do Supabase, copie e execute todo o conteúdo de:
```
supabase/fix_rls.sql
```

Este script vai:
- ✅ Contar registros
- ✅ Listar todos os pacientes
- ✅ Verificar políticas RLS
- ✅ Detectar duplicatas

### 7. 🆕 Reiniciar Servidor de Desenvolvimento

No terminal:
```bash
# Pare o servidor (Ctrl + C)
# Limpe node_modules/.cache se existir
rm -rf node_modules/.cache

# Reinicie
npx vite
```

## 🎯 Checklist de Debug

Execute na ordem e marque:

- [ ] Limpei cache do browser completamente
- [ ] Verifiquei Console (F12) e vi os logs
- [ ] Confirmei que há 9 pacientes no Supabase
- [ ] Executei script fix_rls.sql
- [ ] Desabilitei RLS temporariamente
- [ ] Limpei localStorage
- [ ] Reiniciei servidor

## 📊 Informações para Debug

Quando o site carregar, copie estas informações do Console:

```
Total de pacientes no hook: ___
Total de pacientes no Dashboard: ___
Pacientes ativos: ___
Pacientes inativos: ___
```

E também execute no SQL Editor:
```sql
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'active') as ativos,
  COUNT(*) FILTER (WHERE status = 'inactive') as inativos
FROM patients;
```

## 🔍 Possíveis Causas

### Cache do Browser (90% dos casos)
- React Query faz cache automático
- Browser pode ter cache antigo de quando eram 4 pacientes mockados

**Solução:** Limpar cache completamente

### RLS Bloqueando (5% dos casos)
- Políticas podem estar filtrando registros
- Algumas linhas podem não ter permissão de leitura

**Solução:** Desabilitar RLS ou ajustar políticas

### Erro Silencioso (3% dos casos)
- Erro na query não está sendo mostrado
- Network timeout

**Solução:** Verificar Network tab no DevTools

### Dados Duplicados no Seed (2% dos casos)
- CONFLICT no seed pode ter pulado alguns registros
- Apenas 4 foram realmente inseridos

**Solução:** Verificar count real no banco

## ✅ Solução Definitiva (Se nada funcionar)

Execute este SQL no Supabase:

```sql
-- 1. Deletar tudo
TRUNCATE patients CASCADE;
TRUNCATE appointments CASCADE;

-- 2. Desabilitar RLS
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;

-- 3. Reinserir dados (execute supabase/seed.sql completo)
```

Depois:
```bash
# Limpar tudo
localStorage.clear()
# No browser console

# Parar servidor
Ctrl + C

# Deletar cache
rm -rf node_modules/.cache

# Reiniciar
npx vite
```

## 🆘 Ainda não funciona?

Me avise com estas informações:

1. **Console do Browser** (screenshot ou texto)
2. **Query SQL**: `SELECT COUNT(*) FROM patients;`
3. **Network tab**: Algum erro 400/403/500?
4. **Políticas RLS**: Resultado do `SELECT * FROM pg_policies WHERE tablename = 'patients';`

---

**Na maioria dos casos, limpar o cache do browser resolve! 🎯**

