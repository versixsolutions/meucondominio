# 🚀 GUIA DE EXECUÇÃO - MIGRAÇÃO 300 FAQs v2.0

## ⚠️ ATENÇÃO - LEIA ANTES DE EXECUTAR

Esta migração irá:

- ✅ Fazer backup automático da tabela FAQs atual (tabela `faqs_backup_20251202`)
- ❌ **DROPAR** a tabela `public.faqs` atual
- ✅ Criar nova estrutura com 20 categorias granulares
- ✅ Inserir 300 FAQs otimizadas
- ✅ Criar índices, triggers e views

---

## 📋 MÉTODO 1: Arquivo Unificado (RECOMENDADO)

### Passo 1: Backup Manual (Opcional mas Recomendado)

Acesse o Supabase Dashboard:

```
https://supabase.com/dashboard/project/gjsnrrfuahfckvjlzwxw/sql
```

Execute este SQL para criar backup:

```sql
CREATE TABLE IF NOT EXISTS public.faqs_backup_20251202 AS
SELECT * FROM public.faqs;

SELECT
    COUNT(*) as total_faqs_backupeadas,
    COUNT(DISTINCT category) as total_categorias
FROM public.faqs_backup_20251202;
```

### Passo 2: Executar Migração Completa

1. Acesse: https://supabase.com/dashboard/project/gjsnrrfuahfckvjlzwxw/sql

2. Abra o arquivo:

   ```
   docs/MIGRATION_300_FAQS_UNIFIED.sql
   ```

3. Copie TODO o conteúdo (164KB)

4. Cole no SQL Editor do Supabase

5. Clique em **RUN** (ou Ctrl+Enter)

6. Aguarde a execução (pode levar 2-5 minutos)

### Passo 3: Verificação

Execute no SQL Editor:

```sql
-- Contar total de FAQs
SELECT COUNT(*) as total_faqs
FROM public.faqs
WHERE condominio_id = '5c624180-5fca-41fd-a5a0-a6e724f45d96';
-- Esperado: 300

-- Distribuição por categoria
SELECT category, COUNT(*) as count
FROM public.faqs
WHERE condominio_id = '5c624180-5fca-41fd-a5a0-a6e724f45d96'
GROUP BY category
ORDER BY count DESC;
-- Esperado: 17 categorias

-- Verificar metadados
SELECT
    COUNT(*) FILTER (WHERE tags IS NOT NULL AND array_length(tags, 1) > 0) as with_tags,
    COUNT(*) FILTER (WHERE keywords IS NOT NULL AND array_length(keywords, 1) > 0) as with_keywords,
    COUNT(*) FILTER (WHERE article_reference IS NOT NULL) as with_references,
    COUNT(*) FILTER (WHERE question_variations IS NOT NULL) as with_variations
FROM public.faqs
WHERE condominio_id = '5c624180-5fca-41fd-a5a0-a6e724f45d96';
```

---

## 📋 MÉTODO 2: Arquivos Individuais

Se preferir executar um por vez (mais lento mas mais seguro):

### Ordem de Execução

Execute cada arquivo **NA ORDEM EXATA** no SQL Editor:

1️⃣ **scripts/backup-faqs-antiga.sql**

- Cria backup da tabela atual

2️⃣ **docs/versix_norma_faqs_v2.sql**

- DROP TABLE + CREATE TABLE novo schema
- INSERTs FAQs 1-90 (Piscina, Festas, Esportes)

3️⃣ **docs/versix_norma_faqs_v2_continuacao.sql**

- INSERTs FAQs 91-170 (Animais, Financeiro início)

4️⃣ **docs/versix_norma_faqs_v2_parte3.sql**

- INSERTs FAQs 141-215 (Financeiro, Segurança)

5️⃣ **docs/versix_norma_faqs_v2_FINAL.sql**

- INSERTs FAQs 216-240 (Obras, Emergências)

6️⃣ **docs/versix_norma_faqs_complemento_final.sql**

- INSERTs FAQs 241-285 (Governança)

7️⃣ **docs/versix_norma_faqs_300_COMPLETO.sql**

- INSERTs FAQs 286-300 (Conflitos, Horários)
- CREATEs views analytics

---

## ✅ CHECKLIST DE VERIFICAÇÃO

Após executar a migração, confirme:

- [ ] Total de 300 FAQs inseridas
- [ ] 17 categorias com distribuição correta
- [ ] Backup da tabela antiga existe (`faqs_backup_20251202`)
- [ ] Metadados preenchidos (tags, keywords, article_reference)
- [ ] Índices criados (verificar `pg_indexes`)
- [ ] RLS policies ativas
- [ ] Triggers funcionando

---

## 🔍 TROUBLESHOOTING

### Erro: "relation faqs does not exist"

**Solução**: Normal na primeira execução. O script cria a tabela.

### Erro: "duplicate key value violates unique constraint"

**Solução**: Tabela já tem dados. Execute o backup SQL primeiro para limpar.

### Erro: "permission denied for table faqs"

**Solução**: Use o SQL Editor do dashboard (tem permissão de admin).

### Timeout ao executar

**Solução**: Arquivo muito grande. Execute método 2 (arquivos individuais).

---

## 📊 RESULTADOS ESPERADOS

Após migração bem-sucedida:

```
total_faqs: 300
total_categorias: 17
with_tags: ~250
with_keywords: ~280
with_references: ~240
with_variations: ~200
```

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ Migração SQL completa
2. ⏭️ Configurar HuggingFace token
3. ⏭️ Executar re-indexação Qdrant
4. ⏭️ Testar queries no chatbot
5. ⏭️ Atualizar frontend (categorias)

---

## 🆘 SUPORTE

Em caso de dúvidas ou problemas:

- Verifique logs do Supabase Dashboard
- Consulte arquivo: `docs/IMPLEMENTACAO_300_FAQS.md`
- Reverta para backup: `RENAME TABLE faqs_backup_20251202 TO faqs;`

---

**Status**: ✅ Pronto para execução  
**Última atualização**: 2025-12-02  
**Desenvolvido por**: Versix Solutions
