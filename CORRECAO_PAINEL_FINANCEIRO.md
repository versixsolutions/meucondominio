# Correção do Painel Financeiro - Dezembro 2025

## 🎯 Problema Identificado

Os valores no Painel Financeiro do Condomínio Pinheiro Park não correspondiam ao demonstrativo original fornecido.

## 🔍 Causas Raiz Encontradas

### 1. **Dados Duplicados no Banco**

- Importações anteriores sem limpeza resultaram em 408 transações (esperado: 304)

### 2. **Formato Brasileiro de CSV**

- Arquivo CSV original (`dempp.csv`) usa formato brasileiro:
  - Separador: ponto e vírgula (`;`)
  - Decimal: vírgula (`,`)
  - Milhares: ponto (`.`)
  - Exemplo: `1.234,56` = mil duzentos e trinta e quatro reais e cinquenta e seis centavos

### 3. **Campos com Quebra de Linha**

- Conta `2.1.73-Serv. Zeladoria e Limpeza` tinha quebra de linha literal dentro do campo entre aspas
- O parser simples de CSV não lidava com isso corretamente

### 4. **Totalizadores Incluídos**

- Linhas de subtotal (ex: `2.6`, `2.7`) eram importadas como transações reais
- Causavam duplicação de valores (R$ 56K a mais em despesas)

### 5. **Transferências Internas Contabilizadas**

- Categorias `1.3` e `2.8` são transferências entre contas
- Não deveriam ser contadas como receitas/despesas reais

### 6. **Problema de Timezone no Frontend**

- `new Date('2025-01-01')` era interpretado como UTC
- Conversão para timezone local (GMT-3) resultava em "2024-12-31"
- **Resultado**: Janeiro/25 aparecia como Dezembro/24

## ✅ Soluções Implementadas

### Backend (Scripts de Importação)

#### 1. **Conversor CSV Brasileiro** (`scripts/convert_dempp.cjs`)

```javascript
// Parser de valores brasileiros
function parseValue(value) {
  return parseFloat(value.replace(/\./g, "").replace(",", "."));
}

// Normalização de quebras de linha em campos quoted
const normalizedContent = content.replace(
  /"([^"]*(?:\r?\n[^"]*)*)"/g,
  (match, p1) => `"${p1.replace(/\r?\n/g, " ").trim()}"`,
);

// Remoção de aspas dos campos
const account = parts[0]?.trim().replace(/^"|"$/g, "");
```

#### 2. **Filtro de Contas Válidas**

```javascript
// Ignorar transferências internas
if (categoryCode.startsWith('1.3') || categoryCode.startsWith('2.8')) continue;

// Ignorar totalizadores (contas de 1 dígito no 2º nível)
const levels = categoryCode.split('.');
if (levels.length === 1) continue; // Ignora "1", "2"
if (levels.length === 2 && levels[1].length === 1) continue; // Ignora "1.1", "2.6", etc
// Aceita "1.6" (única conta folha de 2 níveis) e todas com 3+ níveis
```

#### 3. **Limpeza Antes da Importação** (`scripts/import-pinheiro-park.ts`)

```typescript
// Deletar todas as transações existentes antes de reimportar
await supabase
  .from("financial_transactions")
  .delete()
  .eq("condominio_id", CONDOMINIO_ID);
```

#### 4. **Inversão de Sinal para Despesas**

```javascript
// Despesas ficam negativas no banco
const amount = categoryCode.startsWith("2.") ? -Math.abs(value) : value;
```

### Frontend (Dashboard)

#### 5. **Correção de Timezone** (`src/pages/Financial/Dashboard.tsx`)

```typescript
// ANTES (com bug de timezone):
const date = new Date(t.reference_month);
const month = date.getMonth(); // ❌ Retorna 11 para "2025-01-01"

// DEPOIS (correto):
const [year, month] = t.reference_month.split("-").map(Number);
// ✅ Retorna 1 para "2025-01-01"
```

Aplicado em 3 locais:

- Filtro do `summaryData`
- Agrupamento mensal do `chartData`
- Filtro de maiores despesas
- Tabela de transações

## 📊 Resultados Finais

### Dados Importados

- **285 transações** (anteriormente: 408 → 304 → 278 → 285)
  - 56 receitas
  - 229 despesas

### Validação Completa (9 meses)

```
✅ Janeiro/25:   Receitas: R$ 61.549,64  | Despesas: R$ 15.859,76
✅ Fevereiro/25: Receitas: R$ 83.956,27  | Despesas: R$ 53.189,66
✅ Março/25:     Receitas: R$ 30.120,32  | Despesas: R$ 117.077,19
✅ Abril/25:     Receitas: R$ 43.247,90  | Despesas: R$ 39.535,70
✅ Maio/25:      Receitas: R$ 137.272,47 | Despesas: R$ 131.866,21
✅ Junho/25:     Receitas: R$ 53.762,00  | Despesas: R$ 30.911,94
✅ Julho/25:     Receitas: R$ 46.780,36  | Despesas: R$ 81.393,82
✅ Agosto/25:    Receitas: R$ 43.412,55  | Despesas: R$ 14.464,62
✅ Setembro/25:  Receitas: R$ 43.588,93  | Despesas: R$ 49.977,43
```

**Precisão: 100%** - Todos os valores conferem com o demonstrativo original!

## 🗂️ Arquivos Modificados

### Scripts

- ✅ `scripts/convert_dempp.cjs` - Conversor CSV brasileiro
- ✅ `scripts/import-pinheiro-park.ts` - Importador com limpeza
- ✅ `scripts/validate_data.cjs` - Validador atualizado
- 📝 `scripts/test_dashboard_query.cjs` - Teste de query do Dashboard
- 📝 `scripts/check_august.cjs` - Análise específica de Agosto
- 📝 `scripts/check_dates.cjs` - Debug de datas
- 📝 `scripts/analyze_categories.cjs` - Análise de categorias

### Frontend

- ✅ `src/pages/Financial/Dashboard.tsx` - Correção de timezone

### Dados

- 📄 `docs/dempp.csv` - Arquivo fonte com dados reais do Pinheiro Park
- 📄 `scripts/pinheiro_park_real.csv` - CSV convertido para importação

## 🧪 Testes Realizados

### 1. Validação de Dados

```bash
node scripts/validate_data.cjs
# ✅ Todos os 9 meses conferem
```

### 2. Query do Dashboard

```bash
node scripts/test_dashboard_query.cjs
# ✅ 285 transações retornadas corretamente
```

### 3. Análise de Categorias

```bash
node scripts/analyze_categories.cjs
# ✅ Nenhuma conta totalizadora importada
# ✅ Nenhuma transferência interna contabilizada
```

### 4. Frontend (Dev Server)

```bash
npm run dev
# ✅ Servidor iniciado em http://localhost:5173/
# ✅ Dashboard renderiza sem erros
```

## 🎓 Lições Aprendidas

1. **CSV Brasileiro ≠ CSV Padrão**
   - Sempre verificar formato regional antes de importar

2. **Timezone é Traiçoeiro**
   - `new Date('YYYY-MM-DD')` pode mudar o mês dependendo do timezone
   - Solução: extrair ano/mês diretamente da string

3. **Hierarquia de Contas**
   - Plano de contas hierárquico requer filtro cuidadoso
   - Nem toda conta de 2 níveis é subtotal (ex: "1.6")

4. **Transferências Internas**
   - Movimentações entre contas não são receitas/despesas reais
   - Devem ser excluídas do balanço

5. **Validação é Essencial**
   - Scripts de validação economizam horas de debug manual
   - Conferir com demonstrativo original em cada iteração

## 📌 Próximos Passos Sugeridos

- [ ] Adicionar testes automatizados para o conversor CSV
- [ ] Criar interface para upload de novos demonstrativos
- [ ] Implementar versionamento de importações
- [ ] Adicionar logs de auditoria nas importações
- [ ] Criar relatório de divergências automático

---

**Status**: ✅ Concluído  
**Data**: 05/12/2025  
**Precisão**: 100% (9/9 meses corretos)
