# 🎨 Roadmap UX/UI: De 8.0 → 10.0

**Projeto:** Versix Norma  
**Responsável:** Dev UX/UI  
**Prazo:** 60 dias (2 sprints de 30 dias)  
**Rating Atual:** 8.0/10  
**Rating Meta:** 10.0/10  

---

## 📊 Gaps Identificados & Estratégia

```
┌─────────────────────────────────────────────────────────────────┐
│  ÁREA                    │ ATUAL │ META  │ GAP   │ ESFORÇO      │
├─────────────────────────────────────────────────────────────────┤
│  Acessibilidade (A11Y)   │  2/5  │  5/5  │  +3   │  10 dias     │
│  Onboarding              │  2/5  │  5/5  │  +3   │   7 dias     │
│  Hierarquia Visual       │  3/5  │  5/5  │  +2   │   5 dias     │
│  Design System           │  5/5  │  5/5  │   0   │   8 dias     │
│  Micro-interações        │  5/5  │  5/5  │   0   │   3 dias     │
│  Responsividade          │  4/5  │  5/5  │  +1   │   4 dias     │
└─────────────────────────────────────────────────────────────────┘

TOTAL ESFORÇO: 37 dias úteis (cabe em 60 dias com buffer)
```

---

## 🎯 SPRINT 1 (Dias 1-30): Fundação de Excelência

### Semana 1-2: Acessibilidade WCAG 2.1 AA (Prioridade CRÍTICA)

#### Dia 1-2: Auditoria & Setup
```bash
# Instalar ferramentas
npm install --save-dev @axe-core/react eslint-plugin-jsx-a11y
npm install --save-dev @storybook/addon-a11y

# Executar auditoria inicial
npm run lighthouse -- --view
npx axe --chrome
```

**Checklist de Auditoria:**
- [ ] Executar Lighthouse (Desktop + Mobile)
- [ ] Executar axe DevTools em todas páginas principais
- [ ] Testar com NVDA (Windows) ou VoiceOver (Mac)
- [ ] Testar navegação apenas com teclado
- [ ] Verificar contraste com Contrast Checker

**Entregáveis:**
- `ACCESSIBILITY_AUDIT.md` com todos os issues priorizados
- Score baseline registrado

---

#### Dia 3-5: Contraste de Cores (WCAG AA/AAA)

**Problemas Identificados:**
```css
/* ❌ ANTES - Contraste insuficiente */
.stat-label {
  color: var(--gray-400); /* #94a3b8 */
  background: var(--white); /* Ratio: 3.2:1 - FALHA AA */
}

.hero-description {
  color: var(--gray-400); /* #94a3b8 */
  background: var(--navy); /* Ratio: 4.1:1 - FALHA AAA */
}
```

**Solução:**
```css
/* ✅ DEPOIS - Contraste AA/AAA */
:root {
  /* Ajustar gray scale para ratios mínimos */
  --gray-300-accessible: #8897a8; /* 4.5:1 com white */
  --gray-400-accessible: #6b7b8f; /* 7:1 com white */
  --gray-400-dark: #c1cbd8;       /* 7:1 com navy */
}

.stat-label {
  color: var(--gray-400-accessible); /* ✅ 7:1 ratio */
}

.hero-description {
  color: var(--gray-400-dark); /* ✅ 7:1 ratio */
}
```

**Script de Validação:**
```typescript
// scripts/check-contrast.ts
import { contrast } from 'wcag-contrast';

const colorPairs = [
  { fg: '#94a3b8', bg: '#ffffff', name: 'gray-400/white' },
  { fg: '#94a3b8', bg: '#0d2137', name: 'gray-400/navy' },
  // ... todos os pares
];

colorPairs.forEach(pair => {
  const ratio = contrast.ratio(pair.fg, pair.bg);
  const passAA = ratio >= 4.5;
  const passAAA = ratio >= 7;
  
  console.log(`${pair.name}: ${ratio.toFixed(2)}:1 - AA: ${passAA ? '✅' : '❌'}, AAA: ${passAAA ? '✅' : '❌'}`);
});
```

**Entregáveis:**
- [ ] Paleta de cores ajustada com ratios AA/AAA
- [ ] Script de validação automática
- [ ] Documentação de cores acessíveis

---

#### Dia 6-8: ARIA Labels & Semantic HTML

**Componentes a Corrigir:**

```tsx
// ❌ ANTES - Sem semântica
<div className="nav-links">
  <div onClick={handleClick}>Home</div>
  <div onClick={handleClick}>Sobre</div>
</div>

<div className="mobile-menu-btn" onClick={toggleMenu}>
  <i data-lucide="menu"></i>
</div>

// ✅ DEPOIS - Semântico + ARIA
<nav aria-label="Navegação principal">
  <ul className="nav-links">
    <li><a href="#home">Home</a></li>
    <li><a href="#sobre">Sobre</a></li>
  </ul>
</nav>

<button 
  className="mobile-menu-btn"
  aria-label="Abrir menu de navegação"
  aria-expanded={isMenuOpen}
  aria-controls="mobile-menu"
  onClick={toggleMenu}
>
  <i data-lucide="menu" aria-hidden="true"></i>
</button>
```

**Checklist Completo:**

| Componente | ARIA Label | Role | Estado |
|------------|-----------|------|--------|
| Logo | ✅ `aria-label="Versix Solutions - Página inicial"` | - | - |
| Nav Links | ✅ `<nav aria-label="...">` | navigation | - |
| Mobile Menu Btn | ✅ `aria-label` + `aria-expanded` | button | ✅ |
| Search Input | ✅ `aria-label="Buscar documentos"` | searchbox | - |
| Modal | ✅ `aria-modal="true"` + `aria-labelledby` | dialog | ✅ |
| Tooltips | ✅ `aria-describedby` | tooltip | ✅ |
| Form Errors | ✅ `aria-live="polite"` | alert | ✅ |
| Loading | ✅ `aria-busy="true"` + `aria-live` | status | ✅ |

**Implementação de Form Acessível:**
```tsx
// components/ContactForm.tsx
export function ContactForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  return (
    <form 
      onSubmit={handleSubmit}
      aria-label="Formulário de contato"
      noValidate // Validação customizada acessível
    >
      <div className="form-group">
        <label htmlFor="name" id="name-label">
          Nome completo
          <span aria-label="obrigatório"> *</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          aria-labelledby="name-label"
          aria-required="true"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        {errors.name && (
          <span 
            id="name-error" 
            className="error-message"
            role="alert"
            aria-live="polite"
          >
            {errors.name}
          </span>
        )}
      </div>
    </form>
  );
}
```

**Entregáveis:**
- [ ] Todos inputs com labels explícitos
- [ ] ARIA labels em 100% dos elementos interativos
- [ ] Estados dinâmicos com aria-live
- [ ] Validação de formulários acessível

---

#### Dia 9-10: Navegação por Teclado

**Focus Management System:**

```tsx
// hooks/useFocusTrap.ts
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!isActive) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    function handleTabKey(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
    
    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();
    
    return () => container.removeEventListener('keydown', handleTabKey);
  }, [isActive]);
  
  return containerRef;
}
```

**Estados de Foco Visíveis:**
```css
/* ✅ Focus rings consistentes */
*:focus-visible {
  outline: 3px solid var(--teal);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Exceção para elementos com foco interno */
.card:focus-within {
  box-shadow: 0 0 0 3px var(--teal-glow);
}

/* Skip to main content */
.skip-to-main {
  position: absolute;
  top: -100px;
  left: 0;
  background: var(--teal);
  color: white;
  padding: 0.75rem 1.5rem;
  text-decoration: none;
  z-index: 9999;
}

.skip-to-main:focus {
  top: 0;
}
```

**Tab Order Testing:**
```typescript
// tests/a11y/keyboard-nav.test.ts
describe('Keyboard Navigation', () => {
  it('should navigate through all interactive elements', () => {
    cy.visit('/');
    
    // Tab através de todos elementos
    cy.get('body').tab();
    cy.focused().should('contain', 'Skip to main content');
    
    cy.focused().tab();
    cy.focused().should('have.attr', 'href', '#home');
    
    // ... continuar testando tab order lógico
  });
  
  it('should trap focus in modals', () => {
    cy.get('[aria-label="Abrir modal"]').click();
    
    // Tab deve circular dentro do modal
    cy.get('.modal').find('button').first().focus();
    cy.get('.modal').find('button').last().tab();
    cy.focused().should('be', cy.get('.modal').find('button').first());
  });
});
```

**Entregáveis:**
- [ ] Skip to main content link
- [ ] Tab order lógico em todas páginas
- [ ] Focus trap em modais/drawers
- [ ] Focus rings visíveis e bonitos
- [ ] Testes E2E de navegação por teclado

---

#### Dia 11-12: Suporte a Leitores de Tela

**Landmarks ARIA:**
```tsx
// ✅ Estrutura semântica completa
<body>
  <a href="#main-content" className="skip-to-main">
    Pular para conteúdo principal
  </a>
  
  <header role="banner">
    <nav aria-label="Navegação principal">...</nav>
  </header>
  
  <main id="main-content" role="main" aria-label="Conteúdo principal">
    <section aria-labelledby="hero-title">
      <h1 id="hero-title">...</h1>
    </section>
    
    <section aria-labelledby="about-title">
      <h2 id="about-title">...</h2>
    </section>
  </main>
  
  <aside role="complementary" aria-label="Informações adicionais">
    ...
  </aside>
  
  <footer role="contentinfo">
    ...
  </footer>
</body>
```

**Live Regions para Atualizações Dinâmicas:**
```tsx
// components/ChatMessage.tsx
export function ChatMessage({ message, isNew }: Props) {
  return (
    <div 
      className="chat-message"
      role="article"
      aria-label={`Mensagem de ${message.role}`}
      aria-live={isNew ? "polite" : undefined}
      aria-atomic="true"
    >
      <div className="message-content">
        {message.content}
      </div>
      {message.sources && (
        <aside aria-label="Fontes citadas">
          <h4>Fontes:</h4>
          <ul>
            {message.sources.map(source => (
              <li key={source.id}>
                <a href={source.url}>{source.title}</a>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  );
}
```

**Status Messages:**
```tsx
// components/StatusMessage.tsx
export function StatusMessage({ type, message }: Props) {
  const roleMap = {
    error: 'alert',
    success: 'status',
    info: 'status'
  } as const;
  
  return (
    <div
      role={roleMap[type]}
      aria-live="assertive"
      aria-atomic="true"
      className={`status-message status-${type}`}
    >
      <i data-lucide={iconMap[type]} aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
```

**Entregáveis:**
- [ ] Landmarks em 100% das páginas
- [ ] Headings hierárquicos (h1→h2→h3)
- [ ] Live regions para updates dinâmicos
- [ ] Teste completo com NVDA/VoiceOver
- [ ] Documentação de padrões A11Y

---

### Semana 3: Sistema de Onboarding

#### Dia 13-15: Biblioteca & Implementação

**Escolha: Shepherd.js** (Menor bundle, 8kb gzipped vs 35kb do Intro.js)

```bash
npm install shepherd.js
```

**Tour Principal (First-Time Users):**
```typescript
// lib/onboarding/mainTour.ts
import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

export function createMainTour() {
  const tour = new Shepherd.Tour({
    useModalOverlay: true,
    defaultStepOptions: {
      cancelIcon: {
        enabled: true
      },
      classes: 'shepherd-theme-versix',
      scrollTo: { behavior: 'smooth', block: 'center' }
    }
  });

  // Step 1: Boas-vindas
  tour.addStep({
    id: 'welcome',
    title: '👋 Bem-vindo ao Versix Norma!',
    text: `
      <p>Vamos fazer um tour rápido de 2 minutos para você conhecer as principais funcionalidades.</p>
      <p>Você pode pular a qualquer momento clicando no X.</p>
    `,
    buttons: [
      {
        text: 'Pular Tour',
        classes: 'shepherd-button-secondary',
        action: tour.cancel
      },
      {
        text: 'Começar',
        action: tour.next
      }
    ]
  });

  // Step 2: Upload de documentos
  tour.addStep({
    id: 'upload',
    title: '📄 Upload de Documentos',
    text: 'Aqui você pode fazer upload de PDFs como atas de reunião, contratos e regulamentos.',
    attachTo: {
      element: '[data-tour="upload-button"]',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Anterior',
        classes: 'shepherd-button-secondary',
        action: tour.back
      },
      {
        text: 'Próximo',
        action: tour.next
      }
    ]
  });

  // Step 3: Chat com IA
  tour.addStep({
    id: 'chat',
    title: '🤖 Assistente Inteligente',
    text: `
      <p>Faça perguntas sobre seus documentos!</p>
      <p><strong>Exemplo:</strong> "Qual o horário permitido para obras?"</p>
    `,
    attachTo: {
      element: '[data-tour="chat-input"]',
      on: 'top'
    },
    buttons: [
      {
        text: 'Anterior',
        classes: 'shepherd-button-secondary',
        action: tour.back
      },
      {
        text: 'Próximo',
        action: tour.next
      }
    ]
  });

  // Step 4: Dashboard
  tour.addStep({
    id: 'dashboard',
    title: '📊 Painel de Controle',
    text: 'Visualize estatísticas, documentos recentes e ocorrências.',
    attachTo: {
      element: '[data-tour="dashboard"]',
      on: 'right'
    },
    buttons: [
      {
        text: 'Anterior',
        classes: 'shepherd-button-secondary',
        action: tour.back
      },
      {
        text: 'Próximo',
        action: tour.next
      }
    ]
  });

  // Step 5: Configurações
  tour.addStep({
    id: 'settings',
    title: '⚙️ Configurações',
    text: 'Personalize seu condomínio, gerencie usuários e acesse relatórios.',
    attachTo: {
      element: '[data-tour="settings"]',
      on: 'left'
    },
    buttons: [
      {
        text: 'Anterior',
        classes: 'shepherd-button-secondary',
        action: tour.back
      },
      {
        text: 'Finalizar',
        action: tour.complete
      }
    ]
  });

  return tour;
}
```

**Hooks de Controle:**
```typescript
// hooks/useOnboarding.ts
export function useOnboarding() {
  const [hasCompletedTour, setHasCompletedTour] = useLocalStorage(
    'versix-onboarding-completed',
    false
  );

  const startTour = useCallback(() => {
    const tour = createMainTour();
    
    tour.on('complete', () => {
      setHasCompletedTour(true);
      // Track analytics
      analytics.track('Onboarding Completed');
    });
    
    tour.on('cancel', () => {
      // Track analytics
      analytics.track('Onboarding Skipped', {
        step: tour.getCurrentStep()?.id
      });
    });
    
    tour.start();
  }, [setHasCompletedTour]);

  return {
    hasCompletedTour,
    startTour,
    resetTour: () => setHasCompletedTour(false)
  };
}
```

**Trigger no First Login:**
```tsx
// App.tsx
function App() {
  const { user } = useAuth();
  const { hasCompletedTour, startTour } = useOnboarding();
  
  useEffect(() => {
    if (user && !hasCompletedTour) {
      // Delay para UI carregar
      setTimeout(startTour, 1000);
    }
  }, [user, hasCompletedTour, startTour]);
  
  return (
    <div className="app">
      {/* ... */}
      
      {/* Botão para reabrir tour */}
      <button onClick={startTour} data-tour-trigger>
        Refazer Tour
      </button>
    </div>
  );
}
```

**Estilização Customizada:**
```css
/* styles/shepherd-theme.css */
.shepherd-theme-versix {
  --shepherd-theme-primary: var(--teal);
  --shepherd-text-background: var(--white);
  --shepherd-header-background: var(--navy);
}

.shepherd-theme-versix .shepherd-header {
  background: var(--shepherd-header-background);
  color: white;
  padding: 1.5rem;
  border-radius: 12px 12px 0 0;
}

.shepherd-theme-versix .shepherd-text {
  padding: 1.5rem;
  font-size: 0.95rem;
  line-height: 1.6;
}

.shepherd-theme-versix .shepherd-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--gray-200);
  display: flex;
  justify-content: space-between;
}

.shepherd-theme-versix .shepherd-button {
  background: var(--shepherd-theme-primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.shepherd-theme-versix .shepherd-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
}

.shepherd-theme-versix .shepherd-button-secondary {
  background: transparent;
  color: var(--gray-600);
  border: 2px solid var(--gray-300);
}
```

**Entregáveis:**
- [ ] Tour interativo de 5 steps
- [ ] Persistência de estado (localStorage)
- [ ] Analytics tracking de completion
- [ ] Estilização custom alinhada ao design
- [ ] Botão de "refazer tour" em Settings

---

#### Dia 16-17: Tooltips Contextuais

**Sistema de Tooltips:**
```tsx
// components/Tooltip.tsx
import * as RadixTooltip from '@radix-ui/react-tooltip';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  delayDuration?: number;
}

export function Tooltip({ 
  content, 
  children, 
  side = 'top',
  delayDuration = 200 
}: TooltipProps) {
  return (
    <RadixTooltip.Provider delayDuration={delayDuration}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>
          {children}
        </RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            className="tooltip-content"
            side={side}
            sideOffset={5}
            aria-label={typeof content === 'string' ? content : undefined}
          >
            {content}
            <RadixTooltip.Arrow className="tooltip-arrow" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}
```

**Uso em Features Complexas:**
```tsx
// Exemplo: Upload de documentos
<Tooltip content="Formatos aceitos: PDF, DOCX (máx 10MB)">
  <button data-tour="upload-button">
    <i data-lucide="upload" />
    Fazer Upload
  </button>
</Tooltip>

// Exemplo: Categorias de documentos
<Tooltip 
  side="right"
  content={
    <div>
      <strong>Regulamento Interno</strong>
      <p>Normas específicas do seu condomínio</p>
    </div>
  }
>
  <label>
    <input type="radio" name="category" value="regulamento" />
    Regulamento Interno
    <i data-lucide="help-circle" className="help-icon" />
  </label>
</Tooltip>
```

**Mapeamento de Tooltips Necessários:**

| Elemento | Tooltip | Prioridade |
|----------|---------|------------|
| Upload button | Formatos e limite | 🔴 Alta |
| Categorias doc | Explicação de cada | 🔴 Alta |
| Status badges | Significado das cores | 🟡 Média |
| Filtros | Como usar | 🟡 Média |
| Ícones de ação | O que cada um faz | 🟢 Baixa |

**Entregáveis:**
- [ ] Biblioteca de tooltips instalada (Radix UI - free)
- [ ] Tooltips em 100% dos elementos não-óbvios
- [ ] Estilização consistente
- [ ] Acessível (keyboard + screen readers)

---

#### Dia 18-19: Empty States Inteligentes

**Padrão de Empty State:**
```tsx
// components/EmptyState.tsx
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action,
  secondaryAction 
}: EmptyStateProps) {
  return (
    <div className="empty-state" role="status" aria-live="polite">
      <div className="empty-state-icon">
        <Icon size={64} />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      
      {action && (
        <div className="empty-state-actions">
          <button onClick={action.onClick} className="btn btn-primary">
            {action.label}
          </button>
          {secondaryAction && (
            <button 
              onClick={secondaryAction.onClick} 
              className="btn btn-secondary"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
```

**Implementações Específicas:**

```tsx
// Sem documentos
<EmptyState
  icon={FileText}
  title="Nenhum documento cadastrado"
  description="Comece fazendo upload de PDFs com atas, regulamentos ou contratos do seu condomínio."
  action={{
    label: "Fazer Primeiro Upload",
    onClick: () => setShowUploadModal(true)
  }}
  secondaryAction={{
    label: "Ver Tutorial",
    onClick: startTour
  }}
/>

// Sem conversas no chat
<EmptyState
  icon={MessageSquare}
  title="Inicie uma conversa"
  description="Faça perguntas sobre seus documentos. Exemplo: 'Qual o horário permitido para obras?'"
  action={{
    label: "Ver Perguntas Sugeridas",
    onClick: () => setSuggestedQuestions(true)
  }}
/>

// Sem ocorrências
<EmptyState
  icon={AlertCircle}
  title="Nenhuma ocorrência registrada"
  description="Quando moradores reportarem problemas, eles aparecerão aqui."
  action={{
    label: "Criar Ocorrência de Teste",
    onClick: () => setShowCreateModal(true)
  }}
/>
```

**Estilização:**
```css
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  max-width: 400px;
  margin: 0 auto;
}

.empty-state-icon {
  width: 96px;
  height: 96px;
  margin: 0 auto 1.5rem;
  background: var(--gray-100);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-400);
}

.empty-state-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--navy);
  margin-bottom: 0.5rem;
}

.empty-state-description {
  color: var(--gray-500);
  line-height: 1.6;
  margin-bottom: 2rem;
}

.empty-state-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}
```

**Entregáveis:**
- [ ] Componente EmptyState reutilizável
- [ ] Empty states em todas views principais
- [ ] CTAs claros e educativos
- [ ] Design consistente e agradável

---

### Semana 4: Hierarquia Visual & Design System

#### Dia 20-22: Dashboard Redesign

**Problema Atual:**
```
❌ Todos widgets têm mesmo peso visual
❌ Difícil identificar o que é prioritário
❌ Layout genérico sem personalidade
```

**Solução: Sistema de Prioridades Visuais**

```tsx
// components/Dashboard/PriorityCard.tsx
type Priority = 'critical' | 'high' | 'medium' | 'low';

interface PriorityCardProps {
  priority: Priority;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  action?: () => void;
}

export function PriorityCard({ priority, ...props }: PriorityCardProps) {
  const priorityStyles = {
    critical: {
      background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
      icon: AlertTriangle,
      pulse: true
    },
    high: {
      background: 'linear-gradient(135deg, var(--teal) 0%, var(--teal-light) 100%)',
      icon: TrendingUp,
      pulse: false
    },
    medium: {
      background: 'var(--white)',
      border: '2px solid var(--gray-200)',
      icon: Activity,
      pulse: false
    },
    low: {
      background: 'var(--gray-50)',
      icon: Info,
      pulse: false
    }
  };

  const style = priorityStyles[priority];
  const Icon = style.icon;

  return (
    <div 
      className={`priority-card priority-${priority} ${style.pulse ? 'pulse' : ''}`}
      style={style.background ? { background: style.background } : {}}
    >
      <div className="priority-card-header">
        <Icon size={24} />
        <h3>{props.title}</h3>
      </div>
      <div className="priority-card-value">
        {props.value}
      </div>
      {props.subtitle && (
        <p className="priority-card-subtitle">{props.subtitle}</p>
      )}
      {props.trend && (
        <div className={`trend trend-${props.trend.isPositive ? 'up' : 'down'}`}>
          {props.trend.isPositive ? '↗' : '↘'} {props.trend.value}%
        </div>
      )}
    </div>
  );
}
```

**Layout com Hierarquia:**
```tsx
// pages/Dashboard.tsx
export function Dashboard() {
  return (
    <div className="dashboard-grid">
      {/* ROW 1: Crítico - Full Width */}
      <div className="dashboard-row-critical">
        <PriorityCard
          priority="critical"
          title="Ocorrências Urgentes"
          value={3}
          subtitle="Requerem atenção imediata"
          action={() => navigate('/ocorrencias')}
        />
      </div>

      {/* ROW 2: Alto - 2 columns */}
      <div className="dashboard-row-high">
        <PriorityCard
          priority="high"
          title="Taxa de Ocupação Chat IA"
          value="87%"
          trend={{ value: 12, isPositive: true }}
        />
        <PriorityCard
          priority="high"
          title="Documentos Processados"
          value={245}
          subtitle="Últimos 30 dias"
        />
      </div>

      {/* ROW 3: Médio - 3 columns */}
      <div className="dashboard-row-medium">
        <PriorityCard priority="medium" title="Moradores Ativos" value={1240} />
        <PriorityCard priority="medium" title="Atas Recentes" value={8} />
        <PriorityCard priority="medium" title="Votações Abertas" value={2} />
      </div>

      {/* ROW 4: Low - Feed de atividades */}
      <div className="dashboard-row-low">
        <ActivityFeed />
      </div>
    </div>
  );
}
```

**CSS Grid com Hierarquia:**
```css
.dashboard-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(12, 1fr);
}

.dashboard-row-critical {
  grid-column: 1 / -1; /* Full width */
}

.dashboard-row-critical .priority-card {
  min-height: 200px;
  font-size: 1.5rem;
}

.dashboard-row-high {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.dashboard-row-medium {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.dashboard-row-low {
  grid-column: 1 / -1;
}

/* Pulse animation para crítico */
@keyframes pulse-border {
  0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); }
  50% { box-shadow: 0 0 0 10px rgba(220, 38, 38, 0); }
}

.priority-card.pulse {
  animation: pulse-border 2s infinite;
}
```

**Entregáveis:**
- [ ] Sistema de prioridades visuais implementado
- [ ] Dashboard com hierarquia clara
- [ ] Responsivo em todos breakpoints
- [ ] Animações sutis para atenção

---

#### Dia 23-25: Storybook Setup

**Instalação:**
```bash
npx storybook@latest init
npm install --save-dev @storybook/addon-a11y
```

**Configuração:**
```typescript
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y', // ✅ A11Y addon
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
};

export default config;
```

**Theme Preview:**
```typescript
// .storybook/preview.ts
import type { Preview } from '@storybook/react';
import '../src/styles/globals.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
        ],
      },
    },
  },
};

export default preview;
```

**Stories Essenciais:**

```tsx
// src/components/Button/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Botão Primário',
  },
};

export const WithIcon: Story = {
  args: {
    variant: 'primary',
    children: (
      <>
        <i data-lucide="upload" />
        Fazer Upload
      </>
    ),
  },
};

export const Loading: Story = {
  args: {
    variant: 'primary',
    isLoading: true,
    children: 'Processando...',
  },
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    disabled: true,
    children: 'Desabilitado',
  },
};
```

**Documentação de Design Tokens:**
```tsx
// src/stories/DesignTokens/Colors.stories.mdx
import { Meta, ColorPalette, ColorItem } from '@storybook/blocks';

<Meta title="Design System/Colors" />

# Paleta de Cores

## Cores Primárias

<ColorPalette>
  <ColorItem
    title="Navy"
    subtitle="Cor primária"
    colors={{
      'Deep Navy': '#0a1628',
      'Navy': '#0d2137',
      'Navy Light': '#1a3a52',
    }}
  />
  <ColorItem
    title="Teal"
    subtitle="Cor de destaque"
    colors={{
      'Teal': '#14b8a6',
      'Teal Light': '#2dd4bf',
      'Teal Glow': 'rgba(45, 212, 191, 0.15)',
    }}
  />
</ColorPalette>

## Escala de Cinzas

<ColorPalette>
  <ColorItem
    title="Grays"
    subtitle="Neutros"
    colors={{
      'Gray 50': '#f8fafc',
      'Gray 100': '#f1f5f9',
      'Gray 200': '#e2e8f0',
      'Gray 300': '#cbd5e1',
      'Gray 400': '#94a3b8',
      'Gray 500': '#64748b',
      'Gray 600': '#475569',
      'Gray 800': '#1e293b',
    }}
  />
</ColorPalette>

## Contraste WCAG

Todos os pares de cores atendem WCAG 2.1 AA (4.5:1) ou AAA (7:1):

| Foreground | Background | Ratio | Rating |
|------------|------------|-------|--------|
| Gray 400   | White      | 7.2:1 | AAA ✅ |
| Gray 500   | White      | 9.8:1 | AAA ✅ |
| Teal       | Navy       | 5.1:1 | AA ✅  |
```

**Componentes para Documentar:**
- [ ] Button (todas variantes)
- [ ] Input (text, email, password, textarea)
- [ ] Card (priority, standard)
- [ ] Badge (status, category)
- [ ] Modal/Dialog
- [ ] Tooltip
- [ ] EmptyState
- [ ] Loading States

**Entregáveis:**
- [ ] Storybook configurado e rodando
- [ ] 15+ componentes documentados
- [ ] Design tokens documentados
- [ ] A11Y checks em todas stories
- [ ] Deploy no Chromatic (free tier)

---

#### Dia 26-28: Skeleton Loaders & Loading States

**Sistema de Skeletons:**
```tsx
// components/Skeleton.tsx
interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({ 
  width = '100%', 
  height = 20, 
  variant = 'rectangular',
  animation = 'pulse'
}: SkeletonProps) {
  const styles = {
    width,
    height,
    borderRadius: variant === 'circular' ? '50%' : variant === 'text' ? '4px' : '8px',
  };

  return (
    <div 
      className={`skeleton skeleton-${variant} skeleton-${animation}`}
      style={styles}
      aria-busy="true"
      aria-label="Carregando conteúdo"
    />
  );
}
```

**Skeletons Compostos:**
```tsx
// components/DocumentCardSkeleton.tsx
export function DocumentCardSkeleton() {
  return (
    <div className="document-card" aria-busy="true">
      <div className="document-card-header">
        <Skeleton variant="circular" width={40} height={40} />
        <div style={{ flex: 1 }}>
          <Skeleton width="60%" height={16} />
          <Skeleton width="40%" height={14} style={{ marginTop: 8 }} />
        </div>
      </div>
      <div className="document-card-body">
        <Skeleton width="100%" height={12} />
        <Skeleton width="90%" height={12} />
        <Skeleton width="70%" height={12} />
      </div>
      <div className="document-card-footer">
        <Skeleton width={80} height={24} variant="rectangular" />
        <Skeleton width={80} height={24} variant="rectangular" />
      </div>
    </div>
  );
}
```

**CSS Animations:**
```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--gray-100) 0%,
    var(--gray-200) 50%,
    var(--gray-100) 100%
  );
  background-size: 200% 100%;
}

.skeleton-pulse {
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.skeleton-wave {
  animation: skeleton-wave 1.5s linear infinite;
}

@keyframes skeleton-wave {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

**Uso nos Componentes:**
```tsx
// pages/Documents.tsx
export function Documents() {
  const { data: documents, isLoading } = useDocuments();

  if (isLoading) {
    return (
      <div className="documents-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <DocumentCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="documents-grid">
      {documents.map(doc => (
        <DocumentCard key={doc.id} document={doc} />
      ))}
    </div>
  );
}
```

**Entregáveis:**
- [ ] Componente Skeleton reutilizável
- [ ] Skeletons específicos (Card, List, Form)
- [ ] Animações suaves (pulse/wave)
- [ ] Uso consistente em todas loading states

---

### Semana 5: Responsividade & Polish

#### Dia 29-30: Testes em Devices Reais

**Checklist de Testes:**

| Device | Viewport | Orientação | Status |
|--------|----------|------------|--------|
| iPhone SE | 375x667 | Portrait | ⬜ |
| iPhone 12 Pro | 390x844 | Portrait | ⬜ |
| iPad Mini | 768x1024 | Portrait | ⬜ |
| iPad Mini | 1024x768 | Landscape | ⬜ |
| iPad Pro | 1024x1366 | Portrait | ⬜ |
| Samsung Galaxy S21 | 360x800 | Portrait | ⬜ |
| Desktop | 1920x1080 | - | ⬜ |

**Ferramentas:**
```bash
# BrowserStack (free tier) ou
# Usar devices físicos da equipe
```

**Issues Comuns a Verificar:**
- [ ] Touch targets mínimo 44x44px
- [ ] Texto legível sem zoom (min 16px)
- [ ] Modals ocupam bem a tela mobile
- [ ] Inputs não fazem zoom indesejado (font-size >= 16px)
- [ ] Landscape não quebra layout
- [ ] Tablets têm layout intermediário (não desktop nem mobile)

**Fixes Específicos:**
```css
/* ✅ Touch targets mobile */
@media (max-width: 768px) {
  button, a, input, select {
    min-height: 44px;
    min-width: 44px;
  }
  
  /* Evitar zoom em inputs */
  input, select, textarea {
    font-size: 16px; /* ✅ Crítico! */
  }
}

/* ✅ Layout tablet (768px - 1024px) */
@media (min-width: 768px) and (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: repeat(6, 1fr);
  }
  
  .dashboard-row-high {
    grid-template-columns: 1fr; /* Stack em tablet portrait */
  }
}

/* ✅ Landscape mobile */
@media (max-width: 896px) and (orientation: landscape) {
  .hero {
    min-height: auto;
    padding: 2rem 0;
  }
}
```

**Entregáveis:**
- [ ] Testes em 7+ devices documentados
- [ ] Bugs corrigidos
- [ ] Screenshots de cada device
- [ ] Report de compatibilidade

---

## 🎯 SPRINT 2 (Dias 31-60): Refinamento & Validação

### Semana 6-7: Performance & Otimização

#### Dia 31-35: Lighthouse Score > 95

**Auditoria Inicial:**
```bash
npm run build
npx lighthouse http://localhost:3000 --view
```

**Otimizações:**

1. **Code Splitting:**
```tsx
// App.tsx - Lazy loading de rotas
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Documents = lazy(() => import('./pages/Documents'));
const Chat = lazy(() => import('./pages/Chat'));

function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </Suspense>
  );
}
```

2. **Image Optimization:**
```tsx
// Use next/image patterns
<img 
  src="/logo.jpg"
  alt="Versix Solutions"
  width={200}
  height={80}
  loading="lazy"
  decoding="async"
/>

// Converter para WebP
npm install --save-dev imagemin imagemin-webp
```

3. **Font Optimization:**
```html
<!-- preload critical fonts -->
<link 
  rel="preload" 
  href="/fonts/outfit-bold.woff2" 
  as="font" 
  type="font/woff2" 
  crossorigin
/>

<!-- font-display: swap -->
<style>
@font-face {
  font-family: 'Outfit';
  src: url('/fonts/outfit-bold.woff2') format('woff2');
  font-display: swap; /* ✅ Evita FOIT */
}
</style>
```

4. **Bundle Analysis:**
```bash
npm install --save-dev vite-plugin-bundle-analyzer
```

```typescript
// vite.config.ts
import { visualizer } from 'vite-plugin-bundle-analyzer';

export default {
  plugins: [
    visualizer({ open: true })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@radix-ui/react-tooltip', 'lucide-react'],
          'vendor-utils': ['date-fns', 'clsx'],
        }
      }
    }
  }
}
```

**Meta de Performance:**
- [ ] Lighthouse Performance > 95
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Time to Interactive < 3.5s
- [ ] Cumulative Layout Shift < 0.1
- [ ] Total Bundle Size < 200kb (gzipped)

---

#### Dia 36-40: Testes A11Y Completos

**Testes Automatizados:**
```typescript
// cypress/e2e/a11y.cy.ts
describe('Accessibility', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.injectAxe();
  });

  it('should have no accessibility violations on homepage', () => {
    cy.checkA11y();
  });

  it('should have no violations after navigation', () => {
    cy.get('a[href="/documents"]').click();
    cy.checkA11y();
  });

  it('should have no violations in modal', () => {
    cy.get('[data-testid="open-modal"]').click();
    cy.checkA11y('.modal');
  });
});
```

**Testes Manuais:**
- [ ] Navegação completa apenas com teclado
- [ ] Teste com NVDA (Windows) - gravar vídeo
- [ ] Teste com VoiceOver (Mac) - gravar vídeo
- [ ] Teste com zoom 200%
- [ ] Teste com cores invertidas (high contrast)
- [ ] Teste com animações desabilitadas

**Report de A11Y:**
```markdown
# Accessibility Audit Report

## Automated Testing
- ✅ axe-core: 0 violations
- ✅ Lighthouse A11Y: 100/100
- ✅ WAVE: 0 errors

## Manual Testing
- ✅ Keyboard navigation: Full coverage
- ✅ Screen reader (NVDA): All content accessible
- ✅ Screen reader (VoiceOver): All content accessible
- ✅ Zoom 200%: No layout breaks
- ✅ High contrast mode: Readable
- ✅ Reduced motion: Animations respect preference

## WCAG 2.1 Compliance
- ✅ Level A: 100%
- ✅ Level AA: 100%
- ⚠️  Level AAA: 95% (color contrast AAA em 95% dos casos)

## Recommendations
- Consider adding audio descriptions for video content (future)
- Maintain this standard in all new features
```

---

### Semana 8: Validação com Usuários

#### Dia 41-45: Preparação Beta Testing

**Protocolo de Teste:**
```markdown
# Versix Norma - Beta Testing Protocol

## Objetivos
1. Validar usabilidade do onboarding
2. Identificar friction points na UX
3. Medir satisfação com A11Y
4. Coletar feedback qualitativo

## Participantes
- 5 beta users (condominios já identificados)
- 2 usuários com deficiência visual (recruit via partners)

## Tarefas
1. Primeiro acesso (onboarding)
2. Upload de documento
3. Fazer 3 perguntas ao chatbot
4. Navegar no dashboard
5. Criar uma ocorrência (se aplicável)

## Métricas
- Time to First Value (tempo até primeira resposta útil do chat)
- Task Completion Rate
- System Usability Scale (SUS) score
- Net Promoter Score (NPS)

## Ferramentas
- Hotjar (free tier) - heatmaps + session recordings
- Google Forms - questionário pós-teste
- Zoom - entrevistas qualitativas (gravar)
```

**Setup Hotjar:**
```html
<!-- Adicionar ao <head> -->
<script>
  (function(h,o,t,j,a,r){
    h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
    h._hjSettings={hjid:YOUR_HOTJAR_ID,hjsv:6};
    a=o.getElementsByTagName('head')[0];
    r=o.createElement('script');r.async=1;
    r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
    a.appendChild(r);
  })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
</script>
```

**Questionário SUS:**
```
System Usability Scale (1-5, discordo totalmente → concordo totalmente)

1. Eu usaria este sistema frequentemente
2. Achei o sistema desnecessariamente complexo
3. Achei o sistema fácil de usar
4. Precisaria de ajuda técnica para usar
5. As funções estavam bem integradas
6. Havia muita inconsistência no sistema
7. A maioria aprenderia rapidamente
8. Achei o sistema desajeitado
9. Me senti confiante usando o sistema
10. Precisei aprender muito antes de começar

Score = ((Soma ímpares - 5) + (25 - Soma pares)) * 2.5
Meta: SUS > 80 (Excelente)
```

---

#### Dia 46-50: Execução Beta + Iterações

**Cronograma:**
- Dia 46: Onboarding dos 5 beta users + setup
- Dia 47-48: Observação ativa + coleta de dados
- Dia 49: Entrevistas qualitativas (1h cada)
- Dia 50: Análise de dados + priorização de fixes

**Template de Entrevista:**
```markdown
## Entrevista Beta User (60min)

### Warm-up (5min)
- Como foi sua primeira impressão?
- O que mais chamou atenção?

### Onboarding (10min)
- O tour foi útil? Muito longo/curto?
- Algo ficou confuso?
- Você pularia alguma etapa?

### Features (30min)
- Upload: Foi intuitivo? Teve dúvidas?
- Chat: As respostas foram úteis? Formato adequado?
- Dashboard: Encontrou o que precisava? O que faltou?

### Acessibilidade (se aplicável) (10min)
- [Para usuários com deficiência]
- O que funcionou bem?
- O que poderia melhorar?

### Wrap-up (5min)
- NPS: Recomendaria? (0-10)
- Principal ponto forte?
- Principal ponto fraco?
```

**Análise de Dados:**
```typescript
// scripts/analyze-beta-results.ts
interface BetaResult {
  userId: string;
  timeToFirstValue: number; // seconds
  tasksCompleted: number;
  tasksTotal: number;
  susScore: number;
  npsScore: number;
  qualitativeFeedback: string[];
}

function analyzeBetaResults(results: BetaResult[]) {
  const avgTimeToValue = mean(results.map(r => r.timeToFirstValue));
  const completionRate = mean(results.map(r => r.tasksCompleted / r.tasksTotal));
  const avgSUS = mean(results.map(r => r.susScore));
  const nps = calculateNPS(results.map(r => r.npsScore));
  
  console.log(`
    📊 Beta Testing Results
    ━━━━━━━━━━━━━━━━━━━━━━
    ⏱️  Time to First Value: ${avgTimeToValue.toFixed(1)}s (meta: <60s)
    ✅ Task Completion: ${(completionRate * 100).toFixed(1)}% (meta: >90%)
    🎯 SUS Score: ${avgSUS.toFixed(1)}/100 (meta: >80)
    💚 NPS: ${nps.toFixed(1)} (meta: >50)
  `);
  
  return { avgTimeToValue, completionRate, avgSUS, nps };
}
```

---

#### Dia 51-55: Fixes Pós-Beta

**Priorização de Feedback:**
```
HIGH PRIORITY (must fix antes do launch)
□ [Issue 1 reportado por 3+ users]
□ [Issue 2 que bloqueia workflow]
...

MEDIUM PRIORITY (fix em próximo sprint)
□ [Nice-to-have reportado por 2 users]
...

LOW PRIORITY (backlog)
□ [Edge case ou preferência pessoal]
...
```

**Changelog:**
```markdown
## v0.2.0-beta.2 (Pós-Beta Fixes)

### Fixed
- Onboarding agora skippable a qualquer momento
- Tooltip de categorias mais claro
- Focus trap em modal de upload corrigido
- Contraste de badges ajustado para AAA

### Improved
- Dashboard reordena cards por prioridade do usuário
- Empty state do chat sugere perguntas contextuais
- Feedback visual ao fazer upload (progress bar)

### Performance
- Lazy loading de imagens no dashboard
- Bundle size reduzido em 15%
```

---

### Semana 9: Documentação Final

#### Dia 56-60: Documentação & Handoff

**Documentos a Criar:**

1. **UX/UI Guidelines** (`docs/UX_GUIDELINES.md`)
```markdown
# Versix Norma - UX/UI Guidelines

## Princípios de Design
1. **Acessibilidade First**: WCAG 2.1 AA em tudo
2. **Clareza sobre Criatividade**: Função antes de forma
3. **Progressiva Disclosure**: Mostrar só o necessário
4. **Feedback Imediato**: Toda ação tem resposta visual

## Sistema de Cores
[referência ao Storybook]

## Componentes
[referência ao Storybook]

## Padrões de Interação
### Modals
- Sempre com backdrop
- Focus trap ativo
- ESC para fechar
- Close button visível

### Forms
- Labels explícitos
- Validação inline
- Mensagens de erro claras
- Estados de loading

## Responsividade
- Mobile first
- Breakpoints: 768px, 1024px
- Touch targets: min 44x44px
- Font-size inputs: min 16px (evita zoom)

## Acessibilidade
### Checklist para novos componentes
- [ ] Semântica HTML correta
- [ ] ARIA labels onde necessário
- [ ] Navegável por teclado
- [ ] Estados de foco visíveis
- [ ] Testado com screen reader
- [ ] Contraste WCAG AA mínimo
```

2. **A11Y Checklist** (`docs/A11Y_CHECKLIST.md`)
```markdown
# Accessibility Checklist

Use esta checklist para toda nova feature:

## Estrutura
- [ ] HTML semântico (header, nav, main, aside, footer)
- [ ] Landmarks ARIA (`role="banner"`, `role="navigation"`, etc)
- [ ] Headings hierárquicos (h1 → h2 → h3, sem pulos)
- [ ] Skip to main content link

## Interatividade
- [ ] Todos elementos interativos são `<button>` ou `<a>`
- [ ] ARIA labels em ícones e botões sem texto
- [ ] Estados dinâmicos com `aria-expanded`, `aria-selected`, etc
- [ ] Modais com `aria-modal="true"` e focus trap
- [ ] Forms com labels explícitos e `aria-describedby` para errors

## Visual
- [ ] Contraste mínimo 4.5:1 (textos normais)
- [ ] Contraste mínimo 3:1 (textos grandes >18px)
- [ ] Focus rings visíveis (não `outline: none` sem substituição)
- [ ] Informação não depende apenas de cor

## Teclado
- [ ] Tab order lógico
- [ ] Todos elementos focáveis com `:focus-visible`
- [ ] Sem keyboard traps (exceto modals intencionais)
- [ ] Atalhos documentados (se houver)

## Conteúdo
- [ ] Alt text em imagens informativas
- [ ] `aria-hidden="true"` em imagens decorativas
- [ ] Textos legíveis sem zoom (min 16px base)
- [ ] Links descritivos ("Saiba mais" → "Saiba mais sobre X")

## Dinâmico
- [ ] `aria-live` para updates importantes
- [ ] Loading states com `aria-busy="true"`
- [ ] Erros com `role="alert"`
- [ ] Respeita `prefers-reduced-motion`

## Testes
- [ ] axe DevTools: 0 violations
- [ ] Lighthouse A11Y: >95
- [ ] Navegação apenas com teclado: OK
- [ ] Teste com NVDA ou VoiceOver: OK
```

3. **Storybook Published**
```bash
# Deploy no Chromatic (free para open source)
npm install --save-dev chromatic
npx chromatic --project-token=YOUR_TOKEN

# Ou GitHub Pages
npm run build-storybook
# Deploy para gh-pages
```

4. **Vídeo Walkthrough**
- Gravar tour de 10min mostrando:
  - Design system no Storybook
  - Onboarding flow
  - Principais padrões A11Y
  - Como testar acessibilidade
- Upload no Loom (free) ou YouTube (unlisted)

**Entregáveis Finais:**
- [ ] UX Guidelines completo
- [ ] A11Y Checklist
- [ ] Storybook publicado
- [ ] Vídeo walkthrough
- [ ] Report de beta testing
- [ ] Handoff para dev team

---

## 📈 Critérios de Sucesso (Rating 10/10)

```
┌─────────────────────────────────────────────────────────────┐
│  ÁREA                    │ META  │ MÉTRICA                  │
├─────────────────────────────────────────────────────────────┤
│  Acessibilidade (A11Y)   │  5/5  │ WCAG 2.1 AA: 100%        │
│                          │       │ Lighthouse A11Y: 100     │
│                          │       │ axe violations: 0        │
│                          │       │                          │
│  Onboarding              │  5/5  │ Completion rate: >80%    │
│                          │       │ Time to value: <60s      │
│                          │       │ Skip rate: <20%          │
│                          │       │                          │
│  Hierarquia Visual       │  5/5  │ Task success: >90%       │
│                          │       │ Time on task: -30%       │
│                          │       │ (vs baseline)            │
│                          │       │                          │
│  Design System           │  5/5  │ Components docs: 15+     │
│                          │       │ Storybook published: ✅  │
│                          │       │ Guidelines doc: ✅       │
│                          │       │                          │
│  Responsividade          │  5/5  │ Devices tested: 7+       │
│                          │       │ Layout breaks: 0         │
│                          │       │ Touch target fails: 0    │
│                          │       │                          │
│  Performance             │  5/5  │ Lighthouse: >95          │
│                          │       │ LCP: <2.5s               │
│                          │       │ Bundle: <200kb           │
│                          │       │                          │
│  User Satisfaction       │  5/5  │ SUS Score: >80           │
│                          │       │ NPS: >50                 │
│                          │       │ Task completion: >90%    │
└─────────────────────────────────────────────────────────────┘

RATING FINAL: 10.0/10 ✅
```

---

## 🎯 Quick Wins vs Long-Term Investments

### Quick Wins (Dias 1-7)
- ✅ Contraste de cores (2 dias)
- ✅ ARIA labels básicos (3 dias)
- ✅ Focus rings (1 dia)
- ✅ Keyboard nav fixes (1 dia)

**ROI:** Alto impacto, baixo esforço

### Long-Term (Dias 8-60)
- 📚 Storybook completo
- 🎓 Onboarding elaborado
- 📊 Beta testing estruturado
- 📖 Documentação extensa

**ROI:** Fundação para escala

---

## 💡 Recomendações Finais

### Mantenha Sempre
1. **A11Y como requisito**: Nenhuma feature entra em prod sem passar no checklist
2. **Testes com usuários reais**: Mínimo 1x/trimestre
3. **Storybook atualizado**: Componente novo = Story nova
4. **Métricas de UX**: Acompanhar SUS e NPS mensalmente

### Evite
1. ❌ "Acessibilidade depois" → Sempre é mais caro refatorar
2. ❌ Assumir que usuários pensam como você → Teste sempre
3. ❌ Dark patterns para engajamento → Ética first
4. ❌ Trends visuais sem fundamento → Função > forma

---

**Roadmap criado em:** 30/11/2024  
**Próxima revisão:** Após Sprint 1 (Dia 30)  
**Owner:** Dev UX/UI  
**Stakeholders:** Ângelo (CEO), Dev Full Stack, Beta Users

---

*"Acessibilidade não é um recurso, é um requisito fundamental."*
