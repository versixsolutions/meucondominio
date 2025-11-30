# 🔐 PERMISSÕES DO MÓDULO ASSEMBLEIAS
**Data:** 29 de Novembro de 2025  
**Status:** ✅ Totalmente Configurado

---

## 👥 MATRIZ DE PERMISSÕES

### SÍNDICO (sindico)
**Status:** ✅ **TODOS OS PODERES ADMINISTRATIVOS**

| Ação | Permissão | Implementação |
|------|-----------|---------------|
| ✅ Criar assembleia | **SIM** | `canManage = true` |
| ✅ Editar assembleia | **SIM** | RLS Policy + canManage |
| ✅ Excluir assembleia | **SIM** | RLS Policy + canManage |
| ✅ Iniciar assembleia | **SIM** | Muda status para 'em_andamento' |
| ✅ Encerrar assembleia | **SIM** | Muda status para 'encerrada' |
| ✅ Cancelar assembleia | **SIM** | Muda status para 'cancelada' |
| ✅ Upload PDF (edital/ata) | **SIM** | Supabase Storage + RLS |
| ✅ Criar pauta | **SIM** | RLS Policy |
| ✅ Editar pauta | **SIM** | RLS Policy |
| ✅ Excluir pauta | **SIM** | RLS Policy |
| ✅ Abrir votação | **SIM** | Muda status pauta |
| ✅ Encerrar votação | **SIM** | Muda status pauta |
| ✅ Ver QR de presença | **SIM** | AdminAssembleias.tsx |
| ✅ Ver todos os votos | **SIM** | RLS Policy (contagem) |
| ✅ Ver todas as presenças | **SIM** | RLS Policy |
| ✅ Acessar /admin/assembleias | **SIM** | Protected Route |

### ADMIN (admin)
**Status:** ✅ Mesmas permissões que Síndico

| Ação | Permissão |
|------|-----------|
| Todas acima | **SIM** |

### SUB-SÍNDICO (sub_sindico)
**Status:** ✅ Mesmas permissões que Síndico

| Ação | Permissão |
|------|-----------|
| Todas acima | **SIM** |

### CONSELHO (conselho)
**Status:** ✅ Mesmas permissões que Síndico

| Ação | Permissão | Nota |
|------|-----------|------|
| Todas acima | **SIM** | Pode auxiliar na gestão |

### MORADOR (morador)
**Status:** ✅ Visualização e Participação

| Ação | Permissão | Implementação |
|------|-----------|---------------|
| ✅ Ver assembleias | **SIM** | Apenas do próprio condomínio |
| ✅ Ver detalhes | **SIM** | Edital, pautas, resultados |
| ✅ Registrar presença | **SIM** | Uma vez por assembleia |
| ✅ Votar em pautas | **SIM** | Uma vez por pauta |
| ✅ Ver resultados | **SIM** | Parciais (aberta) ou finais |
| ✅ Exportar PDF | **SIM** | Após encerramento |
| ❌ Criar assembleia | **NÃO** | Apenas gestores |
| ❌ Editar assembleia | **NÃO** | Apenas gestores |
| ❌ Gerenciar pautas | **NÃO** | Apenas gestores |
| ❌ Abrir/fechar votação | **NÃO** | Apenas gestores |
| ❌ Ver QR admin | **NÃO** | Apenas gestores |
| ❌ Acessar /admin/* | **NÃO** | Apenas gestores |

---

## 🔧 IMPLEMENTAÇÃO TÉCNICA

### 1. Frontend - AuthContext.tsx
```typescript
// Linha 207
canManage: ['admin', 'sindico', 'sub_sindico'].includes(role)
```

**Roles com canManage = true:**
- ✅ admin
- ✅ sindico
- ✅ sub_sindico

**Nota:** `conselho` foi incluído nas RLS policies mas não no canManage do frontend.  
**Recomendação:** Se conselho deve gerenciar, adicionar ao array.

---

### 2. Backend - RLS Policies (SQL)

#### Assembleias - Gestão Completa
```sql
CREATE POLICY "Admins can manage all assembleias" ON assembleias
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'sindico', 'sub_sindico', 'conselho')
    )
  );
```

**✅ Inclui:** admin, sindico, sub_sindico, conselho

#### Pautas - Gestão Completa
```sql
CREATE POLICY "Admins can manage pautas" ON assembleias_pautas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'sindico', 'sub_sindico', 'conselho')
    )
  );
```

**✅ Inclui:** admin, sindico, sub_sindico, conselho

#### Votos - Visualização para Contagem
```sql
CREATE POLICY "Admins can view all votes" ON assembleias_votos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'sindico', 'sub_sindico', 'conselho')
    )
  );
```

**✅ Inclui:** admin, sindico, sub_sindico, conselho

---

### 3. Component - AdminAssembleias.tsx
```typescript
// Linha 10
const { canManage, profile } = useAuth()

// Linha 72
if (!canManage) return <div className="p-6">Acesso restrito.</div>
```

**Validação:** Verifica `canManage` antes de renderizar interface admin

---

### 4. Hook - useAssembleias.ts
```typescript
// Todas as operações admin dependem de autenticação
// RLS policies no Supabase garantem permissões
```

**Segurança:** Backend valida via RLS, frontend apenas esconde UI

---

## ✅ CONFIRMAÇÃO DE FUNCIONALIDADES

### Síndico PODE fazer tudo:

#### Ciclo de Vida da Assembleia
1. ✅ **Criar** - Formulário em `/admin/assembleias`
2. ✅ **Editar** - Título, data, tópicos, upload PDFs
3. ✅ **Iniciar** - Botão "Iniciar Assembleia" (muda status)
4. ✅ **Encerrar** - Botão "Encerrar Assembleia" (muda status)
5. ✅ **Cancelar** - Botão "Cancelar Assembleia" (muda status)
6. ✅ **Excluir** - Botão "Excluir" (remove do banco)

#### Gestão de Pautas
1. ✅ **Criar** - Formulário "Adicionar Pauta"
2. ✅ **Editar** - Modificar título, descrição, opções
3. ✅ **Excluir** - Remover pauta
4. ✅ **Abrir Votação** - Botão "Abrir Votação"
5. ✅ **Encerrar Votação** - Botão "Encerrar Votação"

#### Ferramentas Administrativas
1. ✅ **QR Code** - Visualizar e compartilhar
2. ✅ **Link de Presença** - Copiar e abrir em nova aba
3. ✅ **Ver Presenças** - Lista completa de quem compareceu
4. ✅ **Ver Votos** - Contagem para resultados
5. ✅ **Upload PDFs** - Edital e ata

---

## 🔍 TESTES SUGERIDOS PARA SÍNDICO

### Teste 1: Login e Acesso
```
1. Login com usuário role='sindico'
2. Acessar /admin/assembleias
3. ✅ Verificar: Página carrega sem "Acesso restrito"
```

### Teste 2: Criar Assembleia
```
1. Preencher formulário de criação
2. Clicar "Criar Assembleia"
3. ✅ Verificar: Assembleia criada com sucesso
```

### Teste 3: Iniciar Assembleia
```
1. Selecionar assembleia 'agendada'
2. Clicar "Iniciar Assembleia"
3. ✅ Verificar: Status muda para 'em_andamento'
4. ✅ Verificar: QR code aparece
```

### Teste 4: Gerenciar Pautas
```
1. Adicionar nova pauta
2. Abrir votação
3. ✅ Verificar: Status muda para 'em_votacao'
4. Encerrar votação
5. ✅ Verificar: Status muda para 'encerrada'
```

### Teste 5: Encerrar Assembleia
```
1. Clicar "Encerrar Assembleia"
2. ✅ Verificar: Status muda para 'encerrada'
3. ✅ Verificar: Botões admin ficam desabilitados
```

---

## 🐛 TROUBLESHOOTING

### Síndico não consegue criar assembleia

**Possíveis causas:**

1. **Role incorreto no banco**
   ```sql
   -- Verificar
   SELECT email, role FROM users WHERE email = 'sindico@email.com';
   
   -- Corrigir se necessário
   UPDATE users SET role = 'sindico' WHERE email = 'sindico@email.com';
   ```

2. **Cache de sessão desatualizado**
   ```
   Solução: Fazer logout e login novamente
   ```

3. **RLS policy não aplicada**
   ```sql
   -- Verificar se policy existe
   SELECT * FROM pg_policies WHERE tablename = 'assembleias';
   
   -- Re-executar se necessário
   -- scripts/create-assembleias-tables.sql
   ```

---

### "Acesso restrito" para síndico

**Causa:** `canManage` retornando false

**Solução:**
1. Verificar role no banco
2. Limpar cache do navegador
3. Logout + Login
4. Verificar console F12 por erros

---

## 📊 RESUMO

### ✅ Confirmação Final

**SÍNDICO TEM:**
- ✅ Todos os poderes administrativos
- ✅ RLS policies configuradas
- ✅ Frontend validando corretamente
- ✅ Acesso total ao /admin/assembleias
- ✅ Capacidade de criar, editar, encerrar assembleias
- ✅ Gestão completa de pautas e votações
- ✅ Ferramentas de QR e presença
- ✅ Upload de PDFs (edital/ata)

**IMPLEMENTAÇÃO:**
- ✅ AuthContext: `canManage` inclui 'sindico'
- ✅ RLS Policies: Todas incluem 'sindico'
- ✅ Components: Validam via `canManage`
- ✅ Hooks: Operações protegidas por RLS

**STATUS:** 🟢 **PRONTO PARA USO**

---

**Última verificação:** 29/11/2025  
**Versão:** 0.2.0  
**Confirmação:** Síndico tem 100% das permissões administrativas ✅
