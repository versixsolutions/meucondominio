# ✅ GUIA DE IMPLEMENTAÇÃO: ARIA LABELS PARA ACESSIBILIDADE

**Status:** 🔄 Em implementação  
**Prioridade:** P0 (Crítico - Acessibilidade)  
**Meta:** Adicionar ARIA labels em ~150 elementos interativos

## 📋 Checklist de Elementos que Precisam de ARIA Labels

### ✅ **1. Botões sem Texto Visível**
Botões que contêm apenas ícones precisam de `aria-label`:

```tsx
// ❌ ANTES (Inacessível)
<button onClick={onClose}>✕</button>
<button onClick={handleEdit}>✏️</button>
<button onClick={handleDelete}>🗑️</button>

// ✅ DEPOIS (Acessível)
<button onClick={onClose} aria-label="Fechar modal">✕</button>
<button onClick={handleEdit} aria-label="Editar item">✏️</button>
<button onClick={handleDelete} aria-label="Excluir item">🗑️</button>
```

### ✅ **2. Modais e Diálogos**
Todo modal precisa de `role="dialog"`, `aria-modal="true"` e `aria-labelledby`:

```tsx
// ✅ Modal Acessível
<div 
  role="dialog" 
  aria-modal="true" 
  aria-labelledby="modal-title"
  className="modal"
>
  <h2 id="modal-title">Título do Modal</h2>
  <button onClick={onClose} aria-label="Fechar modal">✕</button>
  {/* conteúdo */}
</div>
```

### ✅ **3. Navegação e Menus**
Elementos de navegação precisam de semântica adequada:

```tsx
// ✅ Nav Acessível
<nav aria-label="Navegação principal">
  <ul role="list">
    <li>
      <Link to="/" aria-current={isActive('/') ? 'page' : undefined}>
        <span aria-hidden="true">🏠</span>
        <span>Dashboard</span>
      </Link>
    </li>
  </ul>
</nav>

// ✅ Botão de Menu Móvel
<button 
  onClick={toggleMenu}
  aria-label="Abrir menu de navegação"
  aria-expanded={isMenuOpen}
  aria-controls="mobile-menu"
>
  <svg aria-hidden="true">{/* ícone */}</svg>
</button>
```

### ✅ **4. Campos de Formulário**
Todos os inputs precisam de labels associados:

```tsx
// ✅ Input Acessível
<label htmlFor="email">E-mail</label>
<input 
  id="email"
  type="email"
  aria-required="true"
  aria-invalid={hasError}
  aria-describedby={hasError ? "email-error" : undefined}
/>
{hasError && <p id="email-error" role="alert">E-mail inválido</p>}
```

### ✅ **5. Elementos Interativos Decorativos**
Ícones decorativos devem ser ocultados de leitores de tela:

```tsx
// ✅ Ícone Decorativo
<button>
  <span aria-hidden="true">🔥</span>
  <span>Ativas</span>  {/* Texto real para SR */}
</button>

// ✅ SVG Decorativo
<svg aria-hidden="true">
  <path d="..." />
</svg>
```

### ✅ **6. Estados de Toggle**
Botões de toggle precisam de `aria-pressed`:

```tsx
// ✅ Toggle Acessível
<button
  onClick={toggleNotifications}
  aria-pressed={isEnabled}
  aria-label="Ativar notificações"
>
  {isEnabled ? '🔔 Ativo' : '🔕 Inativo'}
</button>
```

### ✅ **7. Listas e Itens de Lista**
```tsx
// ✅ Lista Acessível
<ul role="list" aria-label="Chamados recentes">
  <li>
    <article aria-labelledby="chamado-1-title">
      <h3 id="chamado-1-title">Título do Chamado</h3>
      <p>Descrição...</p>
    </article>
  </li>
</ul>
```

### ✅ **8. Overlays e Áreas Clicáveis**
```tsx
// ✅ Overlay de Modal
<div 
  className="overlay"
  onClick={onClose}
  aria-hidden="true"  // Overlay é decorativo
/>
```

### ✅ **9. Loading States**
```tsx
// ✅ Loading Acessível
<div role="status" aria-live="polite" aria-label="Carregando dados">
  <div className="spinner" aria-hidden="true" />
  <span className="sr-only">Carregando...</span>
</div>
```

### ✅ **10. Alertas e Mensagens**
```tsx
// ✅ Alert Acessível
<div 
  role="alert" 
  aria-live="assertive"
  className="alert-error"
>
  <span aria-hidden="true">⚠️</span>
  <span>Erro ao salvar dados</span>
</div>
```

---

## 🎯 Componentes Prioritários para Atualização

### 🔴 **Alta Prioridade (P0)**
1. ✅ `src/components/ui/Modal.tsx` - Botão de fechar
2. ✅ `src/components/Layout.tsx` - Menu móvel, logout
3. ✅ `src/components/PageLayout.tsx` - Botão voltar
4. ✅ `src/components/Chatbot.tsx` - Botões de controle
5. ✅ `src/components/admin/AdminSidebar.tsx` - Navegação admin

### 🟡 **Média Prioridade (P1)**
6. ⏳ `src/pages/Votacoes.tsx` - Filtros e botões de voto
7. ⏳ `src/pages/Ocorrencias.tsx` - Filtros e ações
8. ⏳ `src/pages/Chamados.tsx` - Filtros e ações
9. ⏳ `src/components/faq/FAQCard.tsx` - Botões de voto
10. ⏳ `src/components/faq/FAQCategory.tsx` - Accordion

### 🟢 **Baixa Prioridade (P2)**
11. ⏳ `src/pages/Profile.tsx` - Edição de perfil
12. ⏳ `src/pages/Financeiro.tsx` - Filtros de categoria
13. ⏳ `src/components/dashboard/*` - Cards e stats

---

## 🛠️ Padrões de Implementação

### **Pattern 1: Botão de Fechar**
```tsx
<button
  onClick={onClose}
  aria-label="Fechar [contexto]"
  className="close-button"
>
  ✕
</button>
```

### **Pattern 2: Botão de Ação com Ícone**
```tsx
<button
  onClick={handleEdit}
  aria-label="Editar [nome do item]"
  title="Editar"  // Tooltip visual
>
  <span aria-hidden="true">✏️</span>
  <span className="sr-only">Editar</span>  // Fallback para SR
</button>
```

### **Pattern 3: Filtro/Toggle**
```tsx
<button
  onClick={() => setFilter('active')}
  className={isActive ? 'active' : ''}
  aria-pressed={isActive}
  aria-label="Filtrar por ativas"
>
  <span aria-hidden="true">🔥</span> Ativas
</button>
```

### **Pattern 4: Link com Ícone**
```tsx
<Link 
  to="/dashboard" 
  aria-current={isActive ? 'page' : undefined}
  aria-label="Ir para dashboard"
>
  <span aria-hidden="true">🏠</span>
  <span>Dashboard</span>
</Link>
```

---

## 📊 Progresso

### Status Atual
- **Elementos identificados:** ~150
- **Elementos corrigidos:** 8 (Modal, Layout, PageLayout, etc.)
- **Progresso:** ~5%
- **Meta:** 100% (150/150)

### Próximos Passos
1. ✅ Atualizar Modal.tsx
2. ✅ Atualizar Layout.tsx (menu móvel)
3. ⏳ Atualizar páginas de votação e ocorrências
4. ⏳ Atualizar componentes FAQ
5. ⏳ Validar com leitor de tela (NVDA/JAWS)
6. ⏳ Testar navegação por teclado

---

## 🧪 Como Validar

### 1. **Lighthouse Audit**
```bash
# No DevTools → Lighthouse → Accessibility
# Meta: Score > 95
```

### 2. **Screen Reader (NVDA/JAWS)**
```
- Instalar NVDA (gratuito)
- Ativar leitor de tela
- Navegar pelo site usando Tab
- Verificar se botões são anunciados corretamente
```

### 3. **axe DevTools Extension**
```
1. Instalar axe DevTools no Chrome
2. Abrir página
3. Executar audit
4. Corrigir todos os "Critical" e "Serious"
```

### 4. **Keyboard Navigation**
```
- Tab: Avança entre elementos
- Shift+Tab: Volta
- Enter/Space: Ativa botões
- Esc: Fecha modais
- Arrow keys: Navega em listas/accordions
```

---

## 📚 Referências

- [ARIA Authoring Practices Guide (APG)](https://www.w3.org/WAI/ARIA/apg/)
- [MDN: ARIA Labels](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-label)
- [WebAIM: Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)

---

## ✅ Conclusão

A adição de ARIA labels é **crítica** para conformidade WCAG 2.1 AA. Todos os elementos interativos devem ter labels descritivos para que usuários de leitores de tela possam navegar e interagir com a aplicação.

**Próxima ação:** Atualizar componentes de páginas (Votacoes, Ocorrencias, Chamados) com ARIA labels apropriados.
