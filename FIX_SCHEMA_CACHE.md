# 🔄 ATUALIZAR SCHEMA CACHE DO SUPABASE

**Problema:** Tabelas criadas mas PostgREST não as reconhece  
**Erro:** `Could not find the table 'public.assembleias' in the schema cache`

---

## 🎯 SOLUÇÃO RÁPIDA

### Opção 1: Reload do Schema Cache (RECOMENDADO)

1. **Acesse o SQL Editor:**
   ```
   https://supabase.com/dashboard/project/gjsnrrfuahfckvjlzwxw/sql/new
   ```

2. **Execute este comando:**
   ```sql
   -- Recarrega o schema cache do PostgREST
   NOTIFY pgrst, 'reload schema';
   ```

3. **Aguarde 5 segundos** e teste novamente:
   ```powershell
   npm run seed:assembleia
   ```

---

### Opção 2: Verificar se Tabelas Existem Realmente

1. **Acesse o SQL Editor:**
   ```
   https://supabase.com/dashboard/project/gjsnrrfuahfckvjlzwxw/sql/new
   ```

2. **Execute:**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name LIKE 'assembleias%'
   ORDER BY table_name;
   ```

3. **Resultado esperado:**
   ```
   assembleias
   assembleias_pautas
   assembleias_presencas
   assembleias_votos
   ```

Se NÃO aparecer nenhuma tabela, significa que a migration não foi executada!

---

### Opção 3: Executar Migration Novamente

Se as tabelas não existirem, execute a migration:

1. **Acesse:**
   ```
   https://supabase.com/dashboard/project/gjsnrrfuahfckvjlzwxw/sql/new
   ```

2. **Copie o conteúdo de:**
   ```
   scripts/create-assembleias-tables.sql
   ```

3. **Cole no SQL Editor e clique em "Run"**

4. **Aguarde a confirmação**

5. **Execute o reload:**
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```

---

## 🔍 DIAGNÓSTICO

O erro acontece porque:
1. ✅ Tabelas foram criadas no banco
2. ❌ PostgREST (API) ainda não atualizou o cache
3. ❌ Script de seed usa a API (não SQL direto)

**Solução:** Forçar reload do cache com `NOTIFY pgrst`

---

## ✅ APÓS O FIX

### Opção A: Seed via SQL (RECOMENDADO)

Execute o SQL diretamente no Supabase (bypassa RLS):

1. **Acesse:**
   ```
   https://supabase.com/dashboard/project/gjsnrrfuahfckvjlzwxw/sql/new
   ```

2. **Copie e cole:**
   ```
   scripts/seed-assembleia.sql
   ```

3. **Clique em "Run"**

### Opção B: Seed via Script (requer usuário admin)

Se você tem um usuário admin cadastrado:

```powershell
npm run seed:assembleia
```

Ou configure credenciais no `.env.local`:
```env
SEED_ADMIN_EMAIL=admin@seuemail.com
SEED_ADMIN_PASSWORD=suasenha
```

**Resultado esperado:**
```
✅ Seed de assembleia criado com sucesso: abc-123-def-456
   Rota QR/link de presença: /transparencia/assembleias/abc-123-def-456/presenca
```

---

## 📋 COMANDOS ÚTEIS

### Recarregar Schema
```sql
NOTIFY pgrst, 'reload schema';
```

### Listar Tabelas
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### Ver Estrutura da Tabela
```sql
\d assembleias
-- ou
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'assembleias';
```

### Contar Registros
```sql
SELECT COUNT(*) FROM assembleias;
SELECT COUNT(*) FROM assembleias_pautas;
SELECT COUNT(*) FROM assembleias_presencas;
SELECT COUNT(*) FROM assembleias_votos;
```

---

**⏱️ Tempo:** 2 minutos  
**🔧 Complexidade:** Baixa  
**⚠️ Prioridade:** Alta (bloqueia testes)

**👉 Execute `NOTIFY pgrst, 'reload schema';` no SQL Editor agora!**
