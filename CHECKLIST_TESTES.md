# ✅ CHECKLIST DE TESTES - MÓDULO ASSEMBLEIAS
**Data:** 29 de Novembro de 2025  
**Servidor:** http://localhost:5173  
**Status:** 🟢 Dev server rodando

---

## 🎯 TESTES OBRIGATÓRIOS

### 1️⃣ LOGIN E NAVEGAÇÃO BÁSICA
- [ ] Acessar http://localhost:5173/login
- [ ] Login com credenciais de **admin** ou **síndico**
- [ ] Dashboard carrega sem erros
- [ ] Console do navegador (F12) sem erros críticos

---

### 2️⃣ ADMIN - GESTÃO DE ASSEMBLEIAS
**URL:** http://localhost:5173/admin/assembleias

#### Ver Assembleia de Teste
- [ ] Lista carrega com "Assembleia de Teste"
- [ ] Status mostra "Em Andamento"
- [ ] Data/hora aparece corretamente

#### Detalhes da Assembleia
- [ ] Clicar na assembleia de teste
- [ ] Seção de QR Code está visível
- [ ] QR Code renderiza (quadrado preto/branco)
- [ ] Link de presença está visível
- [ ] Botão "Copiar Link" funciona (testar)
- [ ] Botão "Abrir em Nova Aba" funciona

#### Pautas de Votação
- [ ] 2 pautas aparecem:
  - "Aprovação do orçamento 2026" (status: Em Votação)
  - "Troca de empresa de portaria" (status: Pendente)
- [ ] Botão "Encerrar Votação" aparece na primeira pauta
- [ ] Botão "Abrir Votação" aparece na segunda pauta

#### Criar Nova Assembleia
- [ ] Preencher formulário de criação:
  - Título: "Teste Manual"
  - Data: Escolher data futura
  - Tópicos do edital: Digitar 3 tópicos
- [ ] Clicar "Criar Assembleia"
- [ ] Toast de sucesso aparece
- [ ] Nova assembleia aparece na lista

#### Upload de PDF
- [ ] Selecionar assembleia criada
- [ ] Seção "Edital PDF"
- [ ] Clicar "Escolher arquivo"
- [ ] Selecionar um PDF qualquer
- [ ] Clicar "Upload"
- [ ] ⚠️ **CRÍTICO:** Verificar se upload completa sem erro
- [ ] Link do PDF aparece após upload

---

### 3️⃣ MORADOR - VISUALIZAÇÃO
**URL:** http://localhost:5173/transparencia/assembleias

#### Hub de Transparência
- [ ] Fazer logout (se logado como admin)
- [ ] Login com credenciais de **morador**
- [ ] Acessar: http://localhost:5173/transparencia
- [ ] Card "Assembleias" está visível
- [ ] KPIs mostram números corretos
- [ ] Clicar em "Ver Assembleias"

#### Lista de Assembleias
- [ ] Página carrega
- [ ] Assembleia de teste aparece
- [ ] Filtros funcionam (Todos, Agendada, Em Andamento, etc.)
- [ ] Clicar na assembleia de teste

---

### 4️⃣ MORADOR - REGISTRO DE PRESENÇA
**URL:** Usar link copiado do QR Code

#### Via Link Direto
- [ ] Copiar link de presença do admin
- [ ] Colar em nova aba (mesmo navegador, logado)
- [ ] Página de presença carrega
- [ ] Mensagem "Presença registrada com sucesso" aparece
- [ ] ícone ✅ está visível
- [ ] Botão "Voltar para Assembleia" funciona

#### Verificação
- [ ] Voltar para detalhes da assembleia
- [ ] Seção "Presenças" deve mostrar seu nome
- [ ] Contador de presenças incrementado

---

### 5️⃣ MORADOR - VOTAÇÃO EM TEMPO REAL
**URL:** http://localhost:5173/transparencia/assembleias/[ID]

#### Votar em Pauta Aberta
- [ ] Seção "Votações Abertas" está visível
- [ ] Pauta "Aprovação do orçamento 2026" aparece
- [ ] Opções de voto aparecem (Sim, Não, Abstenção)
- [ ] Selecionar uma opção (ex: Sim)
- [ ] Clicar "Confirmar Voto"
- [ ] Toast de sucesso aparece
- [ ] **CRÍTICO:** Botões de voto ficam desabilitados
- [ ] Seção "Resultados Parciais" aparece
- [ ] Seu voto está contabilizado

#### Tentativa de Voto Duplicado
- [ ] Tentar votar novamente
- [ ] Toast de erro: "Você já votou nesta pauta"
- [ ] Voto não é registrado

#### Real-time (Teste Avançado)
- [ ] Abrir assembleia em outra aba/navegador
- [ ] Admin abre votação da segunda pauta
- [ ] **Verificar:** Pauta aparece automaticamente na aba do morador
- [ ] Sem reload da página!

---

### 6️⃣ ADMIN - ENCERRAMENTO E RESULTADOS

#### Encerrar Votação
- [ ] Voltar para admin: http://localhost:5173/admin/assembleias
- [ ] Clicar na assembleia de teste
- [ ] Clicar "Encerrar Votação" na primeira pauta
- [ ] Confirmação aparece
- [ ] Status muda para "Encerrada"

#### Encerrar Assembleia
- [ ] Botão "Encerrar Assembleia" (vermelho)
- [ ] Clicar e confirmar
- [ ] Status da assembleia muda para "Encerrada"
- [ ] Toast de sucesso

---

### 7️⃣ MORADOR - EXPORTAR PDF DE RESULTADOS
**URL:** http://localhost:5173/transparencia/assembleias/[ID]

#### Visualizar Resultados Finais
- [ ] Fazer logout do admin
- [ ] Login como morador
- [ ] Acessar assembleia encerrada
- [ ] Seção "Resultados Finais" está visível
- [ ] Percentuais aparecem
- [ ] Gráficos de barras renderizados

#### Exportar PDF
- [ ] Botão "Exportar Resultados (PDF)" visível
- [ ] Clicar no botão
- [ ] ⚠️ **CRÍTICO:** Download inicia
- [ ] Arquivo PDF baixado
- [ ] Abrir PDF
- [ ] Verificar conteúdo:
  - Cabeçalho com título e data
  - Cada pauta listada
  - Resultados com percentuais
  - Gráficos de barras visíveis
  - Vencedor destacado

---

## 🔥 TESTES CRÍTICOS (ALTA PRIORIDADE)

Estes testes são **obrigatórios** antes de considerar 100% pronto:

### A. Upload de PDF
- [ ] ✅ Upload de edital funciona
- [ ] ✅ URL pública acessível
- [ ] ✅ PDF abre no navegador

### B. Votação Real-time
- [ ] ✅ Voto registrado instantaneamente
- [ ] ✅ Resultados atualizam sem reload
- [ ] ✅ Múltiplos usuários vendo mesmos resultados

### C. QR Code de Presença
- [ ] ✅ QR renderiza corretamente
- [ ] ✅ Link funciona
- [ ] ✅ Presença registrada uma vez por usuário

### D. Export PDF
- [ ] ✅ PDF gerado sem erros
- [ ] ✅ Conteúdo legível e formatado
- [ ] ✅ Gráficos visíveis

---

## 🐛 PROBLEMAS ENCONTRADOS

### Durante os Testes
_(Anote aqui qualquer problema encontrado)_

**Exemplo:**
```
❌ Problema: Upload de PDF falha com erro 403
Esperado: Upload completa
Real: Erro de permissão
Console: "Access denied to bucket"
```

---

## 📊 RESULTADO DOS TESTES

### Resumo
```
Total de testes: 50+
Executados: [ ] / 50
Sucesso: [ ]
Falha: [ ]
Taxa de sucesso: [ ]%
```

### Status por Categoria
- [ ] Login e Navegação: ⬜ Não testado | ✅ Passou | ❌ Falhou
- [ ] Admin - Gestão: ⬜ Não testado | ✅ Passou | ❌ Falhou  
- [ ] Morador - Visualização: ⬜ Não testado | ✅ Passou | ❌ Falhou
- [ ] Presença via QR: ⬜ Não testado | ✅ Passou | ❌ Falhou
- [ ] Votação Real-time: ⬜ Não testado | ✅ Passou | ❌ Falhou
- [ ] Encerramento: ⬜ Não testado | ✅ Passou | ❌ Falhou
- [ ] Export PDF: ⬜ Não testado | ✅ Passou | ❌ Falhou

---

## 🎯 CRITÉRIOS DE ACEITAÇÃO

### Para considerar 100% PRONTO:
1. ✅ Todos os 4 testes críticos passaram
2. ✅ Pelo menos 90% dos testes gerais passaram
3. ✅ Nenhum erro crítico no console
4. ✅ Performance aceitável (< 3s por operação)
5. ✅ UX intuitivo e sem travamentos

---

## 📝 PRÓXIMOS PASSOS APÓS TESTES

### Se tudo passou (✅):
1. Commit das melhorias (se houver)
2. Push para main
3. Smoke tests em produção
4. Notificar stakeholders
5. Celebrar! 🎉

### Se encontrou problemas (❌):
1. Anotar problemas na seção acima
2. Priorizar por criticidade
3. Fixar bugs críticos
4. Re-testar
5. Repetir até 100%

---

**🚀 Dev server:** http://localhost:5173  
**⏱️ Tempo estimado:** 20-30 minutos  
**👥 Necessário:** 2 usuários (admin + morador) ou 2 navegadores

**Boa sorte nos testes!** 🍀
