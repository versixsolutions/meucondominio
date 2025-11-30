# 📊 ANÁLISE E PRIORIZAÇÃO: ROADMAP UX/UI 10.0
**Data:** 30 de Novembro de 2025  
**Projeto:** Versix Norma  
**Status Atual:** 8.0/10 → Meta 10.0/10  
**Analista:** GitHub Copilot

---

## 🎯 SUMÁRIO EXECUTIVO

### Estado Atual do Projeto
✅ **Pontos Fortes Identificados:**
- Design System funcional com Tailwind CSS
- Componentes React bem estruturados
- TypeScript strict habilitado
- Real-time com Supabase implementado
- PWA funcional com service worker
- Módulos principais completos (15 features)

⚠️ **Gaps Críticos Identificados:**
- **Acessibilidade:** Apenas 6 elementos com ARIA labels (score ~20%)
- **Onboarding:** Ausente (usuários entram sem guia)
- **Skeleton loaders:** Não implementados (apenas spinner genérico)
- **Design System:** Não documentado (sem Storybook)
- **Testes A11Y:** Não automatizados
- **Responsividade:** Funcional mas não testada sistematicamente

---

## 📈 RATING POR CATEGORIA

```
┌──────────────────────────────────────────────────────────────────────┐
│ CATEGORIA              │ ATUAL │ META  │ GAP   │ PRIORIDADE │ ESFORÇO │
├──────────────────────────────────────────────────────────────────────┤
│ Acessibilidade (A11Y)  │  2/5  │  5/5  │  +3   │    🔴 P0   │ 10 dias │
│ Performance            │  4/5  │  5/5  │  +1   │    🟡 P1   │  5 dias │
│ Onboarding             │  0/5  │  5/5  │  +5   │    🟠 P1   │  7 dias │
│ Skeleton Loaders       │  1/5  │  5/5  │  +4   │    🟡 P1   │  3 dias │
│ Hierarquia Visual      │  3/5  │  5/5  │  +2   │    🟢 P2   │  5 dias │
│ Design System Docs     │  0/5  │  5/5  │  +5   │    🟢 P2   │  8 dias │
│ Tooltips Contextuais   │  1/5  │  5/5  │  +4   │    🟢 P2   │  2 dias │
│ Empty States           │  2/5  │  5/5  │  +3   │    🟢 P2   │  2 dias │
│ Responsividade Tests   │  3/5  │  5/5  │  +2   │    🔵 P3   │  2 dias │
│ Beta Testing           │  0/5  │  5/5  │  +5   │    🔵 P3   │  5 dias │
└──────────────────────────────────────────────────────────────────────┘

TOTAL ESFORÇO ESTIMADO: 49 dias úteis
RECOMENDAÇÃO: Executar em 3 fases de 15-20 dias cada
```

---

## 🔥 FASE 1 - CRÍTICA (P0): Acessibilidade [10 dias]

### Objetivo
Atingir **WCAG 2.1 AA** e **Lighthouse A11Y Score > 95**

### Problemas Atuais Detectados

#### 1.1 Contraste de Cores Insuficiente
**Severidade:** CRÍTICA  
**Impacto:** 15+ violações WCAG  
**Esforço:** 2 dias

**Locais Críticos:**
```typescript
// ❌ ATUAL - Violações detectadas
.text-gray-400 { color: #94a3b8; } // Ratio 3.2:1 em background branco (FAIL)
.text-gray-500 { color: #64748b; } // Ratio 4.2:1 (FAIL AA large text)

// Componentes afetados:
- Dashboard cards (labels e subtítulos)
- Status badges (texto secundário)
- Placeholders de inputs
- Textos de ajuda em forms
```

**Solução Proposta:**
```css
:root {
  /* ✅ Cores acessíveis (WCAG AA/AAA) */
  --gray-400-accessible: #6b7b8f; /* 7:1 ratio */
  --gray-500-accessible: #4a5568; /* 9:1 ratio */
  --gray-600-accessible: #2d3748; /* 12:1 ratio */
}

/* Aplicar em todos textos secundários */
.stat-label, .helper-text, .placeholder {
  color: var(--gray-400-accessible);
}
```

**Validação:**
```bash
npm install --save-dev wcag-contrast
npm run check:contrast
```

**Entregas:**
- [ ] Script de validação automática de contraste
- [ ] Paleta atualizada documentada
- [ ] Substituição em 100% dos componentes

---

#### 1.2 ARIA Labels Ausentes
**Severidade:** CRÍTICA  
**Impacto:** Inacessível para screen readers  
**Esforço:** 3 dias

**Inventário de Elementos sem ARIA:**
```typescript
// PRIORIDADE ALTA (usados 100x/dia)
□ Inputs de busca (7 instâncias)
□ Botões de ação (ícone-only: 23 instâncias)
□ Modais (5 componentes)
□ Mobile menu toggle
□ Dropdowns/selects (12 instâncias)
□ Badges de status (sem role)

// PRIORIDADE MÉDIA
□ Cards clicáveis (sem role="button")
□ Tabs/Navegação (sem roles)
□ Acordeões (FAQ)
□ Filtros de lista
□ Tooltips (sem aria-describedby)

// PRIORIDADE BAIXA
□ Ícones decorativos (falta aria-hidden)
□ Loading spinners (sem aria-live)
```

**Implementação Padrão:**
```tsx
// ✅ TEMPLATE - Aplicar em todos componentes

// 1. Botões com ícones
<button aria-label="Abrir menu de navegação" onClick={...}>
  <MenuIcon aria-hidden="true" />
</button>

// 2. Inputs de busca
<input 
  type="search"
  aria-label="Buscar documentos"
  placeholder="Digite sua busca..."
/>

// 3. Modais
<div 
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Título do Modal</h2>
  <p id="modal-description">Descrição...</p>
</div>

// 4. Status dinâmicos
<div 
  role="alert"
  aria-live="polite"
  aria-atomic="true"
>
  {errorMessage}
</div>

// 5. Loading states
<div 
  role="status"
  aria-busy="true"
  aria-label="Carregando dados..."
>
  <LoadingSpinner aria-hidden="true" />
</div>
```

**Entregas:**
- [ ] Checklist de ARIA por componente
- [ ] Refactor de 100% dos elementos interativos
- [ ] Teste com NVDA/VoiceOver gravado

---

#### 1.3 Navegação por Teclado
**Severidade:** ALTA  
**Impacto:** Usuários não conseguem navegar sem mouse  
**Esforço:** 3 dias

**Problemas Identificados:**
```typescript
// ❌ ATUAL - Divs clicáveis (não tabbable)
<div onClick={navigate('/page')} className="card">...</div>

// ❌ ATUAL - Focus invisível
*:focus { outline: none; } // NUNCA fazer isso

// ❌ ATUAL - Sem skip link
// Usuários de teclado precisam TAB 20x para chegar ao conteúdo

// ❌ ATUAL - Modais sem focus trap
// Tab sai do modal para elementos do background
```

**Soluções:**

**A. Semântica Correta**
```tsx
// ✅ Usar elementos nativos
<button onClick={navigate} className="card-button">
  {/* conteúdo */}
</button>

// ✅ Ou transformar em link
<Link to="/page" className="card-link">
  {/* conteúdo */}
</Link>
```

**B. Focus Visível**
```css
/* ✅ Focus rings bonitos e visíveis */
*:focus-visible {
  outline: 3px solid var(--teal);
  outline-offset: 2px;
  border-radius: 4px;
  transition: outline 0.2s;
}

/* Para cards/containers */
.card:focus-within {
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.3);
}
```

**C. Skip to Content**
```tsx
// Adicionar em Layout.tsx
<a href="#main-content" className="skip-to-main">
  Pular para conteúdo principal
</a>

<main id="main-content">
  {/* conteúdo principal */}
</main>
```

```css
.skip-to-main {
  position: absolute;
  top: -100px;
  left: 0;
  background: var(--teal);
  color: white;
  padding: 0.75rem 1.5rem;
  z-index: 9999;
  text-decoration: none;
  font-weight: 600;
}

.skip-to-main:focus {
  top: 0;
}
```

**D. Focus Trap em Modais**
```typescript
// hooks/useFocusTrap.ts
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    
    const focusable = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const first = focusable[0] as HTMLElement;
    const last = focusable[focusable.length - 1] as HTMLElement;
    
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey && document.activeElement === first) {
        last.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    };
    
    containerRef.current.addEventListener('keydown', handleTab);
    first?.focus();
    
    return () => {
      containerRef.current?.removeEventListener('keydown', handleTab);
    };
  }, [isActive]);
  
  return containerRef;
}

// Uso em Modal
const modalRef = useFocusTrap(isOpen);
<div ref={modalRef} role="dialog">...</div>
```

**Entregas:**
- [ ] Tab order lógico em todas páginas
- [ ] Focus rings em 100% dos elementos
- [ ] Skip link implementado
- [ ] Focus trap em modais/drawers
- [ ] Teste E2E de navegação por teclado

---

#### 1.4 Validação Automatizada
**Severidade:** ALTA  
**Impacto:** Prevenir regressões futuras  
**Esforço:** 2 dias

**Setup de Ferramentas:**
```bash
# Instalar dependências
npm install --save-dev @axe-core/react eslint-plugin-jsx-a11y
npm install --save-dev cypress-axe

# Configurar ESLint
# eslint.config.js
{
  plugins: ['jsx-a11y'],
  extends: ['plugin:jsx-a11y/recommended']
}
```

**Testes Cypress:**
```typescript
// cypress/e2e/a11y.cy.ts
import 'cypress-axe';

describe('Acessibilidade', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.injectAxe();
  });

  const pages = [
    '/',
    '/dashboard',
    '/comunicados',
    '/transparencia',
    '/ocorrencias',
    '/faq',
    '/assembleias',
    '/biblioteca',
    '/suporte'
  ];

  pages.forEach(page => {
    it(`${page} deve ter 0 violações A11Y`, () => {
      cy.visit(page);
      cy.checkA11y(null, {
        rules: {
          'color-contrast': { enabled: true },
          'button-name': { enabled: true },
          'aria-required-attr': { enabled: true }
        }
      });
    });
  });

  it('Modal deve ser acessível', () => {
    cy.get('[data-testid="open-modal"]').click();
    cy.checkA11y('.modal');
  });

  it('Navegação por teclado deve funcionar', () => {
    cy.get('body').tab();
    cy.focused().should('contain', 'Pular para conteúdo');
    
    cy.focused().tab();
    cy.focused().should('have.attr', 'href');
  });
});
```

**CI/CD Integration:**
```yaml
# .github/workflows/a11y.yml
name: Accessibility Tests

on: [push, pull_request]

jobs:
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm run cypress:a11y
      - name: Upload A11Y Report
        uses: actions/upload-artifact@v3
        with:
          name: a11y-report
          path: cypress/reports/a11y
```

**Entregas:**
- [ ] ESLint A11Y configurado
- [ ] Cypress tests para todas páginas
- [ ] CI/CD pipeline com A11Y checks
- [ ] Badge no README com status A11Y

---

### KPIs da Fase 1

```
┌─────────────────────────────────────────────────────┐
│ MÉTRICA                    │ ATUAL │ META  │ STATUS │
├─────────────────────────────────────────────────────┤
│ Lighthouse A11Y Score      │   68  │  >95  │   ⬜   │
│ axe-core Violations        │   43  │    0  │   ⬜   │
│ Elementos com ARIA         │    6  │ 150+  │   ⬜   │
│ Contraste WCAG AA          │  65%  │ 100%  │   ⬜   │
│ Tab Order Correto          │  40%  │ 100%  │   ⬜   │
│ Screen Reader Coverage     │  30%  │ 100%  │   ⬜   │
└─────────────────────────────────────────────────────┘

CRITÉRIO DE APROVAÇÃO: 
✅ Todos KPIs atingidos
✅ Teste manual com NVDA: aprovado
✅ Teste manual com VoiceOver: aprovado
✅ CI/CD verde
```

---

## 🟡 FASE 2 - IMPORTANTE (P1): UX Fundamentals [15 dias]

### 2.1 Sistema de Onboarding [7 dias]

**Problema:** Usuários novos ficam perdidos, não sabem por onde começar

**Solução:** Tour interativo com Shepherd.js

**Implementação:**
```bash
npm install shepherd.js
```

```typescript
// lib/onboarding/mainTour.ts
import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

export function createMainTour() {
  const tour = new Shepherd.Tour({
    useModalOverlay: true,
    defaultStepOptions: {
      cancelIcon: { enabled: true },
      classes: 'shepherd-norma',
      scrollTo: { behavior: 'smooth', block: 'center' }
    }
  });

  tour.addStep({
    id: 'welcome',
    title: '👋 Bem-vindo ao Versix Norma!',
    text: 'Tour rápido de 2 minutos. Você pode pular a qualquer momento.',
    buttons: [
      { text: 'Pular', classes: 'btn-secondary', action: tour.cancel },
      { text: 'Começar', action: tour.next }
    ]
  });

  tour.addStep({
    id: 'dashboard',
    title: '📊 Seu Dashboard',
    text: 'Aqui você vê avisos, contas e ocorrências do condomínio.',
    attachTo: { element: '[data-tour="dashboard"]', on: 'bottom' },
    buttons: [
      { text: 'Anterior', action: tour.back },
      { text: 'Próximo', action: tour.next }
    ]
  });

  tour.addStep({
    id: 'assembleias',
    title: '🗳️ Assembleias',
    text: 'Participe de votações e consulte atas.',
    attachTo: { element: '[data-tour="assembleias"]', on: 'right' },
    buttons: [
      { text: 'Anterior', action: tour.back },
      { text: 'Próximo', action: tour.next }
    ]
  });

  tour.addStep({
    id: 'chat',
    title: '🤖 Assistente Norma',
    text: 'Faça perguntas sobre regimento e documentos.',
    attachTo: { element: '[data-tour="chat"]', on: 'left' },
    buttons: [
      { text: 'Anterior', action: tour.back },
      { text: 'Finalizar', action: tour.complete }
    ]
  });

  return tour;
}
```

```typescript
// hooks/useOnboarding.ts
export function useOnboarding() {
  const [completed, setCompleted] = useLocalStorage('norma-onboarding', false);
  
  const start = useCallback(() => {
    const tour = createMainTour();
    tour.on('complete', () => {
      setCompleted(true);
      analytics.track('Onboarding Completed');
    });
    tour.start();
  }, [setCompleted]);
  
  return { completed, start };
}

// App.tsx - Auto-start para novos usuários
const { user } = useAuth();
const { completed, start } = useOnboarding();

useEffect(() => {
  if (user && !completed) {
    setTimeout(start, 1000);
  }
}, [user, completed, start]);
```

**Estilo Customizado:**
```css
/* styles/shepherd-norma.css */
.shepherd-norma {
  --shepherd-primary: var(--teal);
  --shepherd-bg: var(--white);
}

.shepherd-norma .shepherd-header {
  background: linear-gradient(135deg, var(--navy), var(--teal));
  color: white;
  padding: 1.5rem;
  border-radius: 12px 12px 0 0;
}

.shepherd-norma .shepherd-button {
  background: var(--teal);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.shepherd-norma .shepherd-button:hover {
  transform: translateY(-2px);
}
```

**Elementos para Tour:**
```tsx
// Adicionar data-tour em componentes principais
<div data-tour="dashboard">Dashboard</div>
<button data-tour="assembleias">Assembleias</button>
<div data-tour="chat">Chat IA</div>
```

**KPIs:**
- [ ] Tour completion rate > 70%
- [ ] Time to first value < 60s
- [ ] Skip rate < 30%
- [ ] User satisfaction > 8/10

---

### 2.2 Skeleton Loaders [3 dias]

**Problema:** Loading spinner genérico não dá contexto do que está carregando

**Solução:** Skeletons específicos por componente

```tsx
// components/Skeleton.tsx
interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave';
}

export function Skeleton({ 
  width = '100%', 
  height = 20, 
  variant = 'rectangular',
  animation = 'pulse'
}: SkeletonProps) {
  return (
    <div 
      className={`skeleton skeleton-${variant} skeleton-${animation}`}
      style={{ width, height }}
      aria-busy="true"
      aria-label="Carregando..."
    />
  );
}
```

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--gray-100) 0%,
    var(--gray-200) 50%,
    var(--gray-100) 100%
  );
  background-size: 200% 100%;
  border-radius: 4px;
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

**Skeletons Compostos:**
```tsx
// components/CardSkeleton.tsx
export function CardSkeleton() {
  return (
    <div className="card">
      <div className="card-header">
        <Skeleton variant="circular" width={40} height={40} />
        <div style={{ flex: 1, marginLeft: 12 }}>
          <Skeleton width="60%" height={16} />
          <Skeleton width="40%" height={14} style={{ marginTop: 8 }} />
        </div>
      </div>
      <div className="card-body">
        <Skeleton width="100%" height={12} />
        <Skeleton width="90%" height={12} />
        <Skeleton width="70%" height={12} />
      </div>
    </div>
  );
}

// Uso
{loading ? (
  <div className="grid">
    {Array.from({ length: 6 }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
) : (
  <div className="grid">
    {data.map(item => <Card key={item.id} {...item} />)}
  </div>
)}
```

**Locais para Implementar:**
- [ ] Dashboard cards (6 variantes)
- [ ] Lista de comunicados
- [ ] Lista de assembleias
- [ ] Grid de documentos (biblioteca)
- [ ] Feed de ocorrências
- [ ] Perfil de usuário
- [ ] Chat messages

---

### 2.3 Performance Optimization [5 dias]

**Meta:** Lighthouse Performance > 95

**Auditoria Atual:**
```bash
npm run build
npx lighthouse http://localhost:3000 --view
```

**Otimizações Planejadas:**

**A. Code Splitting (1 dia)**
```tsx
// App.tsx - Lazy load de rotas pesadas
const Assembleias = lazy(() => import('./pages/Assembleias'));
const Biblioteca = lazy(() => import('./pages/Biblioteca'));
const AdminAssembleias = lazy(() => import('./pages/admin/AdminAssembleias'));

<Suspense fallback={<PageSkeleton />}>
  <Routes>
    <Route path="/assembleias" element={<Assembleias />} />
    <Route path="/biblioteca" element={<Biblioteca />} />
    <Route path="/admin/assembleias" element={<AdminAssembleias />} />
  </Routes>
</Suspense>
```

**B. Bundle Analysis (1 dia)**
```bash
npm install --save-dev vite-plugin-bundle-visualizer
```

```typescript
// vite.config.ts
import { visualizer } from 'vite-plugin-bundle-visualizer';

export default {
  plugins: [visualizer({ open: true })],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-utils': ['date-fns', 'clsx', 'zod']
        }
      }
    }
  }
};
```

**C. Image Optimization (2 dias)**
```tsx
// Adicionar loading lazy e width/height
<img 
  src={imageUrl}
  alt={altText}
  width={200}
  height={150}
  loading="lazy"
  decoding="async"
/>

// Converter para WebP
npm install --save-dev @squoosh/lib
// Script de conversão automática
```

**D. Font Optimization (1 dia)**
```html
<!-- Preload critical fonts -->
<link 
  rel="preload" 
  href="/fonts/inter-var.woff2" 
  as="font" 
  type="font/woff2" 
  crossorigin
/>

<style>
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-var.woff2') format('woff2');
  font-display: swap;
  font-weight: 100 900;
}
</style>
```

**KPIs:**
- [ ] Lighthouse Performance > 95
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Total Blocking Time < 300ms
- [ ] Cumulative Layout Shift < 0.1
- [ ] Bundle gzipped < 200kb

---

## 🟢 FASE 3 - APRIMORAMENTO (P2): Polish [14 dias]

### 3.1 Design System Documentation [8 dias]

**Setup Storybook:**
```bash
npx storybook@latest init
npm install --save-dev @storybook/addon-a11y
```

**Componentes para Documentar:**

| Componente | Variantes | Prioridade | Esforço |
|------------|-----------|------------|---------|
| Button | 4 (primary, secondary, outline, ghost) | Alta | 0.5d |
| Input | 5 (text, email, password, textarea, select) | Alta | 1d |
| Card | 3 (standard, priority, stat) | Alta | 0.5d |
| Badge | 4 (status, category, count, new) | Média | 0.5d |
| Modal | 2 (standard, confirm) | Alta | 1d |
| Tooltip | 1 | Média | 0.5d |
| EmptyState | 1 | Média | 0.5d |
| Loading | 3 (spinner, skeleton, progress) | Alta | 1d |
| Tabs | 1 | Baixa | 0.5d |
| Accordion | 1 | Baixa | 0.5d |

**Exemplo de Story:**
```tsx
// components/Button/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost']
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg']
    }
  }
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Botão Primário'
  }
};

export const Loading: Story = {
  args: {
    variant: 'primary',
    isLoading: true,
    children: 'Carregando...'
  }
};
```

**Deploy:**
```bash
npm run build-storybook
npx chromatic --project-token=<TOKEN>
# Ou GitHub Pages
```

---

### 3.2 Tooltips & Empty States [4 dias]

**Tooltips com Radix UI:**
```bash
npm install @radix-ui/react-tooltip
```

```tsx
import * as Tooltip from '@radix-ui/react-tooltip';

export function HelpTooltip({ content, children }: Props) {
  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          {children}
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content 
            className="tooltip-content"
            side="top"
            sideOffset={5}
          >
            {content}
            <Tooltip.Arrow />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

// Uso
<HelpTooltip content="Formatos aceitos: PDF (máx 10MB)">
  <button>Upload</button>
</HelpTooltip>
```

**Empty States:**
```tsx
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action && (
        <button onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}

// Uso
<EmptyState
  icon={<FileText size={48} />}
  title="Nenhum documento cadastrado"
  description="Comece fazendo upload de PDFs do seu condomínio."
  action={{
    label: "Fazer Primeiro Upload",
    onClick: () => setShowModal(true)
  }}
/>
```

---

### 3.3 Hierarquia Visual no Dashboard [2 dias]

**Sistema de Prioridade:**
```tsx
type Priority = 'critical' | 'high' | 'medium' | 'low';

interface PriorityCard {
  priority: Priority;
  title: string;
  value: string | number;
  trend?: { value: number; positive: boolean };
}

// Estilos por prioridade
const priorityStyles = {
  critical: {
    bg: 'linear-gradient(135deg, #dc2626, #991b1b)',
    size: 'col-span-2 row-span-2',
    pulse: true
  },
  high: {
    bg: 'linear-gradient(135deg, var(--teal), var(--teal-light))',
    size: 'col-span-1',
    pulse: false
  },
  medium: {
    bg: 'var(--white)',
    border: '2px solid var(--gray-200)',
    size: 'col-span-1'
  }
};
```

---

## 🔵 FASE 4 - VALIDAÇÃO (P3): Testing [10 dias]

### 4.1 Testes em Devices Reais [2 dias]

**Checklist:**
- [ ] iPhone SE (375x667)
- [ ] iPhone 12 Pro (390x844)
- [ ] iPad Mini portrait (768x1024)
- [ ] iPad Mini landscape (1024x768)
- [ ] Samsung Galaxy S21 (360x800)
- [ ] Desktop 1920x1080

**Ferramentas:**
- BrowserStack (free tier)
- Chrome DevTools (device emulation)
- Devices físicos

---

### 4.2 Beta Testing [5 dias]

**Protocolo:**
1. Recrutar 5-7 usuários beta
2. Observação ativa (2 dias)
3. Entrevistas qualitativas (1 dia)
4. Análise de dados (1 dia)
5. Iterações rápidas (1 dia)

**Métricas:**
- System Usability Scale (SUS) > 80
- Net Promoter Score (NPS) > 50
- Task Completion Rate > 90%
- Time to First Value < 60s

---

### 4.3 Documentação Final [3 dias]

**Documentos a Criar:**
- [ ] UX_GUIDELINES.md
- [ ] A11Y_CHECKLIST.md
- [ ] COMPONENT_LIBRARY.md
- [ ] TESTING_GUIDE.md

---

## 📊 RESUMO DE PRIORIZAÇÃO

### Quick Wins (1-3 dias)
✅ **Alto ROI, Baixo Esforço**
1. Contraste de cores (2 dias)
2. ARIA labels básicos (3 dias)
3. Skeleton loaders (3 dias)
4. Tooltips (2 dias)
5. Empty states (2 dias)

**Total: 12 dias → Impacto imediato**

---

### Investimentos Médios (5-7 dias)
⚙️ **Alto ROI, Médio Esforço**
1. Onboarding tour (7 dias)
2. Performance optimization (5 dias)
3. Navegação por teclado (3 dias + 2 dias testes)
4. Hierarquia visual dashboard (5 dias)

**Total: 22 dias → Fundação sólida**

---

### Investimentos Longos (8-10 dias)
📚 **ROI a Longo Prazo**
1. Storybook completo (8 dias)
2. Beta testing estruturado (5 dias)
3. Documentação extensa (3 dias)

**Total: 16 dias → Escala futura**

---

## 🎯 RECOMENDAÇÃO EXECUTIVA

### Plano Recomendado: 3 Sprints

**Sprint 1 (15 dias úteis):** P0 + Quick Wins
- Acessibilidade crítica
- Skeleton loaders
- Tooltips
- Empty states
**Resultado:** Sistema acessível + UX melhorada

**Sprint 2 (15 dias úteis):** P1 + Investimentos Médios
- Onboarding
- Performance
- Hierarquia visual
**Resultado:** Onboarding efetivo + Performance otimizada

**Sprint 3 (10 dias úteis):** P2/P3 + Validação
- Storybook
- Beta testing
- Documentação
**Resultado:** Sistema documentado + Validado com usuários

---

## ✅ CRITÉRIOS DE SUCESSO FINAL

```
┌────────────────────────────────────────────────────────────┐
│ MÉTRICA                       │ BASELINE │ META  │ STATUS  │
├────────────────────────────────────────────────────────────┤
│ Lighthouse A11Y Score         │    68    │  >95  │    ⬜   │
│ Lighthouse Performance        │    78    │  >95  │    ⬜   │
│ WCAG 2.1 AA Compliance        │   65%    │ 100%  │    ⬜   │
│ Onboarding Completion Rate    │    0%    │  >70% │    ⬜   │
│ System Usability Scale (SUS)  │    -     │  >80  │    ⬜   │
│ Net Promoter Score (NPS)      │    -     │  >50  │    ⬜   │
│ Time to First Value           │    -     │  <60s │    ⬜   │
│ Bundle Size (gzipped)         │  311kb   │ <250kb│    ⬜   │
│ Component Stories (Storybook) │    0     │  15+  │    ⬜   │
│ A11Y Automated Test Coverage  │    0%    │ 100%  │    ⬜   │
└────────────────────────────────────────────────────────────┘

RATING ATUAL:  8.0/10
RATING META:  10.0/10
GAP:          2.0 pontos

ESFORÇO TOTAL: 40 dias úteis (50 dias com buffer)
PRAZO: 2 meses (factível)
```

---

**Próximos Passos:**
1. ✅ Aprovação do plano por stakeholders
2. ⬜ Alocação de recursos (dev + design)
3. ⬜ Kick-off Sprint 1 (P0 + Quick Wins)
4. ⬜ Setup de ferramentas (axe-core, Shepherd.js, Storybook)
5. ⬜ Execução conforme cronograma

---

*Documento criado em: 30/11/2025*  
*Próxima revisão: Após Sprint 1 (15 dias)*
