# Relatório de Revisão do Sistema Condomix

## Fase 1: Análise Inicial e Stack Tecnológica

O sistema Condomix é um aplicativo web construído com a seguinte stack:
*   **Frontend:** React, TypeScript, Tailwind CSS, Vite.
*   **Backend/BaaS (Backend as a Service):** Supabase (Autenticação, Banco de Dados, e possivelmente Storage).

## Fase 2: Identificação de Erros e Propostas de Correção (Arquiteto/Engenheiro Full-Stack)

A análise inicial do código revelou pontos de atenção em segurança, arquitetura e qualidade de código.

| Categoria | Gravidade | Arquivo/Contexto | Descrição do Erro | Proposta de Correção |
| :--- | :--- | :--- | :--- | :--- |
| **Segurança** | **CRÍTICO** | `src/lib/supabase.ts` | O código expõe a chave `VITE_SUPABASE_ANON_KEY` diretamente no frontend. Embora seja a chave "anon", ela permite acesso de leitura a tabelas com RLS desabilitado e pode ser usada para ataques de negação de serviço (DoS) ou abuso de API. | **Ação Imediata:** Garantir que o Row Level Security (RLS) esteja **ativado** em **todas** as tabelas do Supabase. **Melhoria:** Para operações sensíveis (ex: criação de comunicados por síndico), criar *Edge Functions* (serveless) no Supabase ou um *backend* dedicado para encapsular a lógica e usar a chave de serviço (`SUPABASE_SERVICE_ROLE_KEY`), que **NUNCA** deve ser exposta no frontend. |
| **Arquitetura** | **GRAVE** | `src/hooks/useComunicados.ts` | O hook `useComunicados` realiza múltiplas chamadas de `SELECT` dentro de um `Promise.all` para buscar anexos (`comunicado_attachments`) e status de leitura (`comunicado_reads`) para **cada** comunicado. Isso resulta em um problema de *N+1 queries*, onde N é o número de comunicados, causando lentidão e sobrecarga no banco de dados. | **Refatoração:** Utilizar a funcionalidade de *JOIN* ou *Foreign Table Joins* do Supabase (PostgreSQL) para buscar os dados de anexos e leituras em uma única consulta. Alternativamente, usar a sintaxe de *embedding* do Supabase (`.select('*, comunicado_attachments(*), comunicado_reads(*)')`) para reduzir as chamadas de rede. |
| **Qualidade/UX** | **MÉDIO** | `src/hooks/useComunicados.ts` | Uso de um `userId` simulado (`'temp-user-id'`) na linha 12, indicando que a funcionalidade de marcação de leitura está incompleta e não utiliza o usuário autenticado. | **Correção:** Substituir a variável `userId` pela ID real do usuário obtida do `AuthContext` (via `useAuth()`). |
| **Qualidade/UX** | **MÉDIO** | `src/hooks/useDashboardStats.ts` | O hook de estatísticas do Dashboard (`useDashboardStats`) está retornando dados *mockados* (linhas 27-33) e não realiza nenhuma chamada real ao Supabase. | **Correção:** Implementar a lógica de busca de dados reais no Supabase para todas as estatísticas (FAQ, Despesas, Votações, Ocorrências, Comunicados). |
| **Qualidade/UX** | **MÉDIO** | `src/hooks/useOcorrencias.ts` | A lógica para calcular `resolvidas_mes` (linhas 47-54) é ineficiente, pois carrega **todas** as ocorrências e filtra na memória do cliente. | **Melhoria:** Mover a lógica de filtro de data para a *query* do Supabase, utilizando funções de data do PostgreSQL para buscar apenas as ocorrências resolvidas no mês atual, reduzindo a carga de dados e processamento no frontend. |
| **Segurança** | **MÉDIO** | `src/contexts/AuthContext.tsx` | O `signUp` (linhas 86-97) permite o cadastro de novos usuários, mas não há um mecanismo de validação de unidade ou aprovação de síndico/admin. Isso pode levar a cadastros fraudulentos ou não autorizados. | **Melhoria:** Desabilitar o `signUp` por padrão no Supabase (se a plataforma permitir) ou, no mínimo, exigir um campo de `unit_number` e definir o `role` inicial como `pending`. A aprovação final deve ser feita por um `admin` ou `sindico` em um painel de gestão. |

---
*Próxima Fase: Análise de GRC e MVP.*

## Fase 3: Análise de GRC (Governança, Risco e Conformidade) e Avaliação do MVP (O Executor/Faz-Tudo)

O sistema Condomix, como uma plataforma de gestão condominial, lida com dados sensíveis (financeiros e pessoais) e processos críticos (votações, ocorrências). A aderência a GRC é fundamental para a confiança e a legalidade do negócio.

### 3.1. Governança (G)

| Aspecto | Funcionalidade no MVP | Aderência/Risco |
| :--- | :--- | :--- |
| **Definição de Papéis** | Implementado (`sindico`, `morador`, `admin` em `AuthContext.tsx`). | **Aderente.** A segregação de funções é o pilar da Governança. |
| **Transparência Financeira** | `Despesas.tsx`, `useDespesas.ts`. | **Risco Médio.** A transparência exige que os dados de despesas sejam detalhados e, idealmente, vinculados a um orçamento. A ausência de um módulo de **Orçamento/Previsão** e **Prestação de Contas** formal é uma falha de Governança. |
| **Tomada de Decisão** | `Votacoes.tsx`, `useVotacoes.ts`. | **Risco Médio.** Votações devem ser auditáveis. É crucial que o sistema registre quem votou, quando votou e garanta a unicidade do voto, o que deve ser verificado na implementação do `useVotacoes`. |
| **Comunicação Oficial** | `Comunicados.tsx`, `useComunicados.ts`. | **Aderente.** Permite a comunicação formal e o registro de leitura (se corrigido o erro do `userId`). |

### 3.2. Risco (R)

| Aspecto | Funcionalidade no MVP | Aderência/Risco |
| :--- | :--- | :--- |
| **Segurança de Dados** | Supabase com `VITE_SUPABASE_ANON_KEY` exposta. | **Risco CRÍTICO.** Conforme detalhado na Fase 2, a falta de RLS e a exposição da chave anônima são falhas graves de segurança. |
| **Controle de Acesso** | `AuthContext` define papéis. | **Risco Médio.** O processo de `signUp` sem validação (Fase 2) é um risco de acesso não autorizado. |
| **Rastreabilidade (Audit Trail)** | Não evidente no código analisado. | **Risco Alto.** Para GRC, toda ação crítica (criação/edição de despesa, resultado de votação, mudança de status de ocorrência) deve ter um registro imutável de quem fez e quando. O Supabase facilita isso, mas o código deve garantir a inserção desses logs. |

### 3.3. Conformidade (C)

| Aspecto | Funcionalidade no MVP | Aderência/Risco |
| :--- | :--- | :--- |
| **LGPD/Privacidade** | Lida com `email`, `full_name`, `phone`, `unit_number`. | **Risco Alto.** O sistema deve ter políticas claras de retenção, consentimento e exclusão de dados. A funcionalidade de **FAQ** com formulário (`FAQForm.tsx`) pode coletar dados pessoais, exigindo atenção à finalidade e consentimento. |
| **Regulamentação Interna** | `Ocorrencias.tsx`, `FAQ.tsx`. | **Aderente.** As funcionalidades básicas (Ocorrências, FAQ) ajudam a formalizar processos internos. |

### 3.4. Avaliação do MVP

As funcionalidades presentes no código (`Dashboard`, `Comunicados`, `Despesas`, `FAQ`, `Login`, `Ocorrencias`, `Signup`, `Votacoes`) formam um **MVP Funcional**, mas **Inseguro** e **Incompleto** para GRC.

**O MVP atende inicialmente o projeto?**
*   **Sim, em termos de escopo funcional:** Cobre as necessidades básicas de comunicação, finanças e gestão de incidentes de um condomínio.
*   **Não, em termos de escopo de GRC:** Falta o essencial para a Governança (Orçamento, Prestação de Contas) e para o Risco/Conformidade (Segurança de Dados, Rastreabilidade, Gestão de Acesso).

**Conclusão da Fase 3:** O MVP deve ser expandido para incluir módulos de **Gestão de Acesso (Validação de Unidade)** e **Transparência Financeira (Orçamento e Prestação de Contas)** para ser considerado um produto minimamente viável e **legalmente responsável** no contexto de GRC.

## Fase 4: Proposta de Melhorias (Desenvolvedor Front-End/UX)

As melhorias propostas a seguir focam em Arquitetura, Produto e Experiência do Usuário (UX), seguindo o racional de GRC.

### 4.1. Melhorias Técnicas e de Arquitetura (Arquiteto/Engenheiro Full-Stack)

| Área | Proposta de Melhoria | Racional GRC |
| :--- | :--- | :--- |
| **Segurança** | **Implementar RLS em todas as tabelas.** Reforçar o RLS para que cada usuário (morador, síndico) só acesse os dados permitidos. Ex: Morador só vê ocorrências que ele abriu. | **Risco & Conformidade (LGPD).** Proteção de dados e garantia de que o acesso é feito apenas por quem tem permissão. |
| **Performance** | **Refatorar consultas N+1.** Aplicar a correção do erro CRÍTICO da Fase 2 em `useComunicados.ts` e em todos os outros *hooks* que buscam dados relacionados (ex: `useDespesas` para buscar categorias). | **Governança.** Garantir a estabilidade e a escalabilidade do sistema, evitando sobrecarga desnecessária no BaaS. |
| **Infraestrutura** | **Adotar *Edge Functions* para lógica sensível.** Mover a lógica de criação/edição de comunicados, despesas e resultados de votação para funções *serverless* (Supabase Edge Functions ou similar) para usar a chave de serviço e garantir a rastreabilidade. | **Risco.** Centralizar a lógica de negócio e proteger a chave de serviço, aumentando a segurança. |
| **Qualidade de Código** | **Adotar um linter/formatter mais rigoroso.** Configurar o ESLint e Prettier para impor padrões de código e evitar erros comuns. | **Governança.** Manter a qualidade do código, facilitando a manutenção e a auditoria. |

### 4.2. Melhorias de Produto (Desenvolvedor Full-Stack Focado em Produto)

| Módulo | Proposta de Melhoria | Racional GRC |
| :--- | :--- | :--- |
| **Gestão de Acesso** | **Módulo de Aprovação de Cadastro.** Após o `signUp`, o usuário deve ficar com o status `pending`. O síndico/admin deve ter um painel para aprovar ou rejeitar o cadastro, vinculando o usuário à sua unidade. | **Governança & Risco.** Garantir que apenas moradores autorizados tenham acesso ao sistema e aos dados. |
| **Finanças** | **Módulo de Orçamento e Prestação de Contas.** Permitir que o síndico cadastre o orçamento anual e vincule as despesas a ele. Gerar relatórios mensais de prestação de contas. | **Governança & Transparência.** Essencial para a gestão condominial e para a conformidade legal. |
| **Votações** | **Garantia de Voto Único e Secreto.** Implementar um mecanismo que garanta que o voto é único por unidade e, se a votação for secreta, que o resultado não possa ser rastreado ao votante. | **Governança & Conformidade.** Assegurar a validade legal e a integridade das decisões tomadas. |
| **Ocorrências** | **Rastreabilidade de Status.** Implementar um *log* de auditoria para cada mudança de status de ocorrência (aberto -> em andamento -> resolvido), registrando o usuário e o timestamp. | **Risco & Conformidade.** Prover rastreabilidade completa para resolução de disputas e auditoria de processos. |

### 4.3. Melhorias de Experiência do Usuário (UX) (Desenvolvedor Front-End/UX)

| Módulo | Proposta de Melhoria | Racional GRC |
| :--- | :--- | :--- |
| **Navegação** | **Menu de Navegação Intuitivo por Papel.** O menu deve se adaptar ao papel (`morador`, `sindico`, `admin`), mostrando apenas as opções relevantes. Ex: O síndico precisa de acesso rápido ao "Painel de Aprovação de Cadastro". | **Governança.** Reduzir a complexidade e o risco de erros de acesso ou operação por parte do usuário. |
| **Formulários** | **Validação em Tempo Real e Feedback Claro.** Usar bibliotecas como `react-hook-form` e `zod` para validação de formulários (Login, Signup, Criação de Ocorrência) e fornecer mensagens de erro claras e amigáveis. | **UX & Risco.** Melhorar a usabilidade e garantir a integridade dos dados inseridos. |
| **Dashboard** | **Visualização de Dados Relevantes.** O dashboard deve priorizar informações que exigem ação imediata (Ex: "Ocorrências Abertas", "Votações Ativas", "Cadastros Pendentes de Aprovação"). | **Governança & Produto.** Focar o usuário nas tarefas mais importantes para a gestão eficiente. |
| **Acessibilidade** | **Testes de Acessibilidade (WCAG).** Garantir que o sistema seja utilizável por pessoas com deficiência (ex: leitores de tela, navegação por teclado). | **Conformidade.** Atender a padrões de acessibilidade, que são requisitos legais em muitos contextos. |

---
*Próxima Fase: Consolidar e entregar relatório completo de revisão ao usuário.*
