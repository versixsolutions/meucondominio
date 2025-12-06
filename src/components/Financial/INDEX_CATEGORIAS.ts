/**
 * Índice de Categorias Financeiras
 *
 * Todos os componentes e páginas para entrada de transações financeiras
 * com suporte a categorias hierárquicas.
 */

// ============================================
// COMPONENTES
// ============================================

/**
 * CategorySelector
 * @file src/components/Financial/CategorySelector.tsx
 * @description Seletor de categoria com interface hierárquica
 *
 * Uso:
 * ```tsx
 * import { CategorySelector } from '@/components/Financial/CategorySelector';
 *
 * <CategorySelector
 *   type="RECEITA"
 *   value={categoryCode}
 *   onChange={(code, name) => setCategoryCode(code)}
 *   label="Categoria"
 *   required
 * />
 * ```
 */

/**
 * TransactionForm
 * @file src/components/Financial/TransactionForm.tsx
 * @description Formulário completo para entrada de transações
 *
 * Features:
 * - Seleção de tipo (Receita/Despesa)
 * - Seletor de categoria hierárquico
 * - Entrada de data e valor
 * - Validação completa
 * - Integração com Supabase
 *
 * Uso:
 * ```tsx
 * import { TransactionForm } from '@/components/Financial/TransactionForm';
 *
 * <TransactionForm
 *   condominioId="5c624180-5fca-41fd-a5a0-a6e724f45d96"
 *   month="2025-12"
 *   onSuccess={(tx) => console.log('Salvo:', tx)}
 *   onCancel={() => navigate(-1)}
 * />
 * ```
 */

// ============================================
// PÁGINAS
// ============================================

/**
 * AddTransactionPage
 * @file src/pages/Financial/AddTransactionPage.tsx
 * @description Página completa para adicionar transações
 *
 * Route: /financeiro/adicionar-transacao
 *
 * Uso:
 * ```tsx
 * import AddTransactionPage from '@/pages/Financial/AddTransactionPage';
 *
 * // Em router:
 * { path: '/financeiro/adicionar-transacao', element: <AddTransactionPage /> }
 * ```
 */

// ============================================
// ESTRUTURA DE CATEGORIAS
// ============================================

/**
 * RECEITAS (Código: 1.x.xx)
 *
 * 1.1 - Receitas Operacionais
 *   └─ 1.1.01: Taxa de Condomínio
 *   └─ 1.1.03: Taxa Extra
 *   └─ 1.1.05: Taxa de Salão de Festas
 *   └─ 1.1.109: Aluguel de Áreas de Lazer
 *   └─ 1.1.144: Receita minimercado autônomo
 *   └─ 1.1.152: Crédito para realização de eventos
 *   └─ 1.1.83: Rep. Taxa Não Garantidas Comp.Ant
 *
 * 1.2 - Receitas Financeiras
 *   └─ 1.2.02: Multas
 *   └─ 1.2.03: Rendimentos
 *   └─ 1.2.05: Empréstimos
 *   └─ 1.2.06: Estornos
 *
 * 1.3 - Transferências (não contabilizadas)
 *   └─ 1.3.01: Transferências entre contas
 *   └─ 1.3.03: Saldo Caixa
 *
 * 1.4 - Ressarcimentos
 *   └─ 1.4.08: Reembolso
 *
 * 1.6 - Outras Receitas
 */

/**
 * DESPESAS (Código: 2.x.xx)
 *
 * 2.1 - Despesa com Pessoal (7 categorias)
 * 2.2 - Despesa com Impostos (4 categorias)
 * 2.3 - Despesas Administrativas (20 categorias)
 * 2.4 - Despesa com Aquisições (19 categorias)
 * 2.5 - Despesa com Serviços (13 categorias)
 * 2.6 - Despesas Com Manutenções (7 categorias)
 * 2.7 - Despesas Financeiras (5 categorias)
 * 2.8 - Transferências (não contabilizadas) (2 categorias)
 */

// ============================================
// INTEGRAÇÃO COM SUPABASE
// ============================================

/**
 * Tabela: financial_categories
 *
 * Campos:
 * - id: UUID (chave primária)
 * - code: TEXT (ex: "1.1.01")
 * - name: TEXT (ex: "Taxa de Condomínio")
 * - type: TEXT ('RECEITA' ou 'DESPESA')
 * - parent_code: TEXT (código da categoria pai)
 * - description: TEXT (opcional)
 * - is_active: BOOLEAN
 * - created_at: TIMESTAMP
 * - updated_at: TIMESTAMP
 *
 * Total de categorias: ~100
 */

/**
 * Tabela: financial_transactions
 *
 * Inserção automática ao submeter TransactionForm:
 *
 * ```sql
 * INSERT INTO financial_transactions (
 *   condominio_id,
 *   category_code,
 *   type,
 *   description,
 *   amount,
 *   transaction_date,
 *   month,
 *   source
 * ) VALUES (...)
 * ```
 */

// ============================================
// EXEMPLO DE INTEGRAÇÃO NO DASHBOARD
// ============================================

/**
 * Adicionar botão no Dashboard para nova transação:
 *
 * ```tsx
 * import { Plus } from 'lucide-react';
 * import { Link } from 'react-router-dom';
 *
 * <Link
 *   to="/financeiro/adicionar-transacao"
 *   className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
 * >
 *   <Plus className="w-5 h-5" />
 *   Nova Transação
 * </Link>
 * ```
 */

// ============================================
// DICAS DE DESENVOLVIMENTO
// ============================================

/**
 * 1. Recarregar dados após inserção
 *    - Usar query invalidation (React Query)
 *    - Ou re-executar fetch manual
 *
 * 2. Validação de valores
 *    - Converter "1.234,56" para 1234.56
 *    - Validar valores positivos
 *
 * 3. Filtrar categorias por período
 *    - Usar campo 'month' ao consultar
 *    - Agrupar por categoria para relatórios
 *
 * 4. Categorias de transferência
 *    - Códigos 1.3 e 2.8 = transferências internas
 *    - Não contar em totalizadores de receita/despesa real
 */

export {};
