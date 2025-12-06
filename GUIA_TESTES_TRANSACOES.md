# 🧪 GUIA DE TESTES - TRANSAÇÕES FINANCEIRAS

**Data:** 5 de Dezembro de 2025  
**Versão:** 1.0

---

## 📋 PRÉ-REQUISITOS

Antes de testar, confirme:

- [ ] Servidor de desenvolvimento rodando (`npm run dev`)
- [ ] Autenticado na aplicação
- [ ] Supabase conectado e accessible
- [ ] Console browser aberto (F12)

---

## 🎯 TESTES FUNCIONAIS

### Teste 1: Abrir Modal

**Objetivo:** Verificar se o botão abre o modal corretamente

**Passos:**

1. Navegue para `/transparencia/financeiro`
2. Procure pelo botão "+ Nova Transação" no topo
3. Clique no botão
4. Observe o modal aparecer com overlay semi-transparente

**Resultado Esperado:** ✅

- Modal apareça centrado
- Fundo escurecido com overlay
- Formulário visível dentro do modal

**Se Falhar:**

```
❌ Botão não aparece?
   → Verificar: Dashboard.tsx linha ~500
   → Header tem headerAction prop?

❌ Modal não abre?
   → Verificar: showTransactionForm === true
   → Conferir: import de TransactionForm

❌ Overlay não escurece?
   → Verificar: classe "bg-opacity-50" aplicada
```

---

### Teste 2: Seletor de Categorias

**Objetivo:** Validar que categorias carregam corretamente

**Passos:**

1. Modal aberto (Teste 1)
2. Clique no campo "Selecione uma Categoria"
3. Observe o dropdown expandir
4. Verifique se aparecem categorias como:
   - "1.1 - Receitas Operacionais"
   - "1.2 - Receitas Financeiras"
   - "2.1 - Despesa com Pessoal"
   - etc.

**Resultado Esperado:** ✅

- Dropdown expande com ~100 categorias
- Categorias organizadas hierarquicamente
- Grupos são expansíveis
- Subcategorias aparecem ao expandir grupo

**Se Falhar:**

```
❌ Dropdown não abre?
   → Verificar: className="cursor-pointer"

❌ Categorias não aparecem?
   → Supabase: SELECT * FROM financial_categories LIMIT 10
   → Verificar: supabase.from('financial_categories').select()

❌ Categorias duplicadas/faltando?
   → Contar: SELECT COUNT(*) FROM financial_categories
   → Deve ter ~100 registros
```

---

### Teste 3: Preenchimento de Formulário

**Objetivo:** Validar validação e entrada de dados

**Passos:**

1. Modal aberto
2. Preencha os campos assim:
   - **Tipo:** Selecione "Receita" (seletor de botão)
   - **Categoria:** Expanda "1.1 - Receitas Operacionais" → Selecione "1.1.01 - Mensalidades"
   - **Descrição:** Digite "Teste de receita manual"
   - **Valor:** Digite "100,00" (com vírgula)
   - **Data:** Deixe como hoje ou selecione data

**Validações Esperadas:** ✅

- [ ] Campo de valor aceita vírgula decimal (100,00)
- [ ] Botão "Registrar Transação" fica habilitado
- [ ] Não permite valor 0 ou negativo
- [ ] Não permite categoria vazia

**Se Falhar:**

```
❌ Valor com vírgula não funciona?
   → TransactionForm.tsx: parseFloat(value.replace(',', '.'))

❌ Botão não habilita?
   → Verificar: disabled={!isValid || loading}

❌ Campo de data não funciona?
   → Verificar: type="date" input
```

---

### Teste 4: Envio de Transação

**Objetivo:** Validar que a transação é salva no Supabase

**Passos:**

1. Formulário preenchido validamente (Teste 3)
2. Clique no botão "Registrar Transação"
3. Observe o loading state
4. Espere mensagem de sucesso

**Resultado Esperado:** ✅

- Botão muda para loading state
- Mensagem "Transação registrada com sucesso" aparece
- Modal fecha automaticamente após ~1-2 segundos
- Dashboard recarrega com novos dados

**Se Falhar:**

```
❌ Nenhuma resposta?
   → Console: Abra DevTools (F12) → Aba Network
   → Procure por requisição ao Supabase
   → Status deve ser 2xx (sucesso)

❌ Erro no console?
   → Copie a mensagem de erro
   → Procure em TROUBLESHOOTING_TRANSACOES.md

❌ Transação não aparece no dashboard?
   → Supabase: SELECT * FROM financial_transactions
            WHERE source = 'manual_input'
   → Deve ter nova transação

❌ Modal não fecha?
   → handleTransactionSuccess não foi chamado
   → Verificar: onSuccess callback em TransactionForm
```

---

### Teste 5: Recarregamento de Dados

**Objetivo:** Validar que dashboard atualiza com nova transação

**Passos:**

1. Após sucesso (Teste 4), observe o dashboard
2. Procure pela transação em "Transações Recentes"
3. Verifique se:
   - Descrição está correta
   - Valor está correto
   - Categoria está correta
   - Data está correta

**Resultado Esperado:** ✅

- Nova transação aparece na tabela "Transações Recentes"
- Valores dos cards KPI atualizam (Receita Total, Saldo, etc.)
- Gráficos atualizam com novos dados
- Ordem: transações mais recentes primeiro

**Se Falhar:**

```
❌ Transação não aparece na tabela?
   → refreshKey não foi incrementado
   → Verificar: setRefreshKey(k => k + 1)

❌ Valores não atualizam?
   → useEffect dependency: [refreshKey, selectedMonth]
   → Triggerou novo fetch?

❌ Gráficos desatualizam?
   → useMemo depende de transactions
   → Verificar: dep array
```

---

### Teste 6: Página Dedicada

**Objetivo:** Validar acesso à página de entrada dedicada

**Passos:**

1. Navegue para `/transparencia/financeiro/adicionar-transacao`
2. Verifique se página carrega com:
   - Título "Adicionar Transação"
   - Descrição
   - Formulário completo
   - Botão "Voltar"

3. Preencha e envie outro formulário (mesmo processo Teste 3-4)
4. Clique em "Voltar"
5. Deve retornar ao dashboard

**Resultado Esperado:** ✅

- Página carrega sem erros
- Formulário totalmente funcional
- Botão voltar retorna ao dashboard
- Transação salva corretamente

**Se Falhar:**

```
❌ Página 404 / não encontrada?
   → App.tsx: Route path correta?
   → Path: /transparencia/financeiro/adicionar-transacao

❌ Rota não carregada?
   → lazy(() => import("./pages/Financial/AddTransactionPage"))
   → Arquivo existe em: src/pages/Financial/AddTransactionPage.tsx?

❌ Botão voltar não funciona?
   → navigate(-1) ou navigate("/transparencia/financeiro")
```

---

### Teste 7: Validação de Erros

**Objetivo:** Verificar que formulário rejeita dados inválidos

**Passos Teste 7a - Valor Inválido:**

1. Modal aberto
2. Preencha tudo EXCETO valor
3. Observe: botão deve estar desabilitado
4. Tente digitar valor "0"
5. Observe: botão permanece desabilitado

**Resultado:** ✅ Botão desabilitado para valores ≤ 0

**Passos Teste 7b - Categoria Faltando:**

1. Modal aberto
2. Selecione tipo
3. NÃO selecione categoria
4. Tente submeter
5. Observe: mensagem de erro deve aparecer

**Resultado:** ✅ Erro "Selecione uma categoria"

**Passos Teste 7c - Descrição Vazia (opcional):**

1. Deixe descrição em branco
2. Preencha outros campos
3. Tente submeter
4. Observe: deve usar valor padrão ou permitir vazio

**Resultado:** ✅ Comportamento conforme especificado

---

### Teste 8: Responsividade

**Objetivo:** Verificar funcionamento em mobile

**Passos:**

1. Abra DevTools (F12)
2. Ative responsive design (CTRL+SHIFT+M)
3. Teste em viewport de 375px (mobile)
4. Abra modal
5. Preencha formulário
6. Submeta transação

**Resultado Esperado:** ✅

- Modal se adapta ao tamanho da tela
- Botões são clicáveis
- Inputs são acessíveis
- Sem scroll horizontal necessário

**Se Falhar:**

```
❌ Modal não cabe na tela?
   → Verificar: max-h-[90vh] max-w-2xl
   → Ajustar: max-w-full em mobile

❌ Inputs sobrepostos?
   → Verificar: w-full, gap-4 (espaçamento)
```

---

## 🔍 TESTES TÉCNICOS

### Teste 9: Verificação de Dados no Supabase

**Execute no console Supabase SQL:**

```sql
-- Verificar nova transação foi criada
SELECT * FROM financial_transactions
WHERE source = 'manual_input'
ORDER BY created_at DESC
LIMIT 1;

-- Resultado esperado:
-- ✅ 1 linha com os dados preenchidos

-- Verificar categorias disponíveis
SELECT COUNT(*) FROM financial_categories;

-- Resultado esperado:
-- ✅ 100 registros

-- Verificar integridade dos dados
SELECT
  type,
  COUNT(*) as total
FROM financial_categories
GROUP BY type;

-- Resultado esperado:
-- ✅ receita: 24
-- ✅ despesa: 76
```

---

### Teste 10: Verificação de Erros no Console

**DevTools → Console (F12):**

Procure por:

```
❌ Evitar: ReferenceError, TypeError, SyntaxError
✅ Permitido: Network warnings, deprecation notices
✅ Permitido: Supabase auth logs normais
```

**Console limpo?** ✅ Sucesso

---

## 📊 TESTE DE CARGA

### Teste 11: Múltiplas Transações

**Objetivo:** Verificar performance com várias transações

**Passos:**

1. Adicione 10 transações em rápida sucessão
2. Observe se dashboard continua responsivo
3. Verifique se todas aparecem na lista
4. Conferir se somas calculam corretamente

**Resultado:** ✅

- Dashboard não trava
- Todas as 10 transações aparecem
- Somas corretas
- Performance aceitável

---

## ✅ CHECKLIST FINAL DE TESTES

| #   | Teste                       | Status |
| --- | --------------------------- | ------ |
| 1   | Abrir Modal                 | ☐      |
| 2   | Seletor de Categorias       | ☐      |
| 3   | Preenchimento de Formulário | ☐      |
| 4   | Envio de Transação          | ☐      |
| 5   | Recarregamento de Dados     | ☐      |
| 6   | Página Dedicada             | ☐      |
| 7   | Validação de Erros          | ☐      |
| 8   | Responsividade Mobile       | ☐      |
| 9   | Dados no Supabase           | ☐      |
| 10  | Console Limpo               | ☐      |
| 11  | Teste de Carga              | ☐      |

---

## 🎉 CONCLUSÃO

Se todos os testes passarem, o sistema está pronto para:

- ✅ Uso em produção
- ✅ Distribuição aos usuários
- ✅ Coleta de feedback
- ✅ Melhorias futuras

---

## 📞 SUPORTE

**Dúvidas?** Consulte:

- `IMPLEMENTACAO_FINAL_STATUS.md` - Status geral
- `SETUP_CATEGORIAS_COMPLETO.md` - Documentação técnica
- `QUERIES_CATEGORIAS.sql` - Consultas úteis
- Dashboard Supabase - Verificar dados em tempo real

---

**Versão:** 1.0  
**Última Atualização:** 5 de Dezembro de 2025
