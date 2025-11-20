// src/config/theme-pinheiropark.ts
/**
 * TEMA PINHEIRO PARK
 * Sistema de cores e tipografia personalizado
 * 
 * Baseado na identidade visual do condomínio:
 * - Verde Jade como cor principal (natureza, comunidade)
 * - Tons de verde complementares
 * - Marrom terra como acento
 */

export const pinheiroParkTheme = {
  // Informações do condomínio
  name: 'Pinheiro Park',
  slug: 'pinheiropark',
  fullName: 'Condomínio Pinheiro Park',
  
  // Cores principais
  colors: {
    primary: {
      DEFAULT: '#00A86B',    // Verde Jade - Tom principal
      dark: '#00724E',       // Verde Escuro - Hover/destaque
      light: '#00D68F',      // Verde Claro - CTAs/badges
      50: '#E6F7F1',
      100: '#CCEFE3',
      200: '#99DFC7',
      300: '#66CFAB',
      400: '#33BF8F',
      500: '#00A86B',         // PRIMARY
      600: '#008656',
      700: '#006541',
      800: '#00432B',
      900: '#002216',
    },
    
    secondary: {
      DEFAULT: '#2E7D6E',    // Verde Petróleo - Acentos
      dark: '#1F5349',
      light: '#3D9A88',
    },
    
    accent: {
      DEFAULT: '#00D68F',    // Verde Claro - CTAs/badges
      hover: '#00B578',
    },
    
    brown: {
      DEFAULT: '#6B4423',    // Marrom Terra - Complementar
      light: '#00A86B',
      dark: '#4A2F18',
    },
    
    // Cores funcionais (mantidas para consistência)
    success: '#00A86B',      // Reutiliza o verde principal
    warning: '#F59E0B',      // Mantém (não conflita)
    danger: '#EF4444',       // Mantém (não conflita)
    info: '#2E7D6E',         // Verde petróleo
    
    // Cores neutras (cinzas)
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
    
    // Backgrounds
    background: {
      DEFAULT: '#FFFFFF',
      secondary: '#F9FAFB',
      tertiary: '#F3F4F6',
    },
    
    // Textos
    text: {
      primary: '#111827',
      secondary: '#6B7280',
      tertiary: '#9CA3AF',
      inverse: '#FFFFFF',
    },
    
    // Bordas
    border: {
      DEFAULT: '#E5E7EB',
      focus: '#00A86B',
    },
  },
  
  // Tipografia
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      display: ['Poppins', 'Inter', 'sans-serif'],
      mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
    },
    
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
      sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
      base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
      lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
      xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
      '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
    },
    
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  
  // Espaçamentos
  spacing: {
    page: '1.5rem',      // Padding padrão das páginas
    card: '1.25rem',     // Padding interno dos cards
    section: '2rem',     // Espaçamento entre seções
  },
  
  // Bordas e sombras
  borderRadius: {
    sm: '0.375rem',      // 6px
    DEFAULT: '0.5rem',   // 8px
    md: '0.75rem',       // 12px
    lg: '1rem',          // 16px
    xl: '1.5rem',        // 24px
    full: '9999px',
  },
  
  boxShadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    none: 'none',
  },
  
  // Transições
  transitions: {
    fast: '150ms ease-in-out',
    base: '200ms ease-in-out',
    slow: '300ms ease-in-out',
  },
  
  // Gradientes específicos do Pinheiro Park
  gradients: {
    primary: 'linear-gradient(135deg, #00A86B 0%, #2E7D6E 100%)',
    header: 'linear-gradient(135deg, #00724E 0%, #00A86B 100%)',
    card: 'linear-gradient(135deg, rgba(0, 168, 107, 0.05) 0%, rgba(46, 125, 110, 0.05) 100%)',
  },
  
  // Configurações de módulos
  modules: {
    faq: {
      categories: {
        geral: { label: 'Geral', icon: '📋', color: 'blue' },
        regras: { label: 'Regras', icon: '📜', color: 'purple' },
        manutencao: { label: 'Manutenção', icon: '🔧', color: 'orange' },
        financeiro: { label: 'Financeiro', icon: '💰', color: 'green' },
        areas_comuns: { label: 'Áreas Comuns', icon: '🏊', color: 'cyan' },
      },
    },
    
    despesas: {
      categories: {
        manutencao: { label: 'Manutenção', icon: '🔧', color: 'orange' },
        contas: { label: 'Contas', icon: '📄', color: 'blue' },
        administrativo: { label: 'Administrativo', icon: '📁', color: 'purple' },
        limpeza: { label: 'Limpeza', icon: '🧹', color: 'green' },
        seguranca: { label: 'Segurança', icon: '🛡️', color: 'red' },
      },
    },
    
    ocorrencias: {
      statuses: {
        aberta: { label: 'Aberta', icon: '🔴', color: 'red' },
        em_analise: { label: 'Em Análise', icon: '🟡', color: 'yellow' },
        em_andamento: { label: 'Em Andamento', icon: '🔵', color: 'blue' },
        resolvida: { label: 'Resolvida', icon: '🟢', color: 'green' },
        arquivada: { label: 'Arquivada', icon: '⚫', color: 'gray' },
      },
    },
    
    comunicados: {
      priorities: {
        baixa: { label: 'Baixa', icon: '📌', color: 'gray' },
        normal: { label: 'Normal', icon: '📋', color: 'blue' },
        alta: { label: 'Alta', icon: '⚠️', color: 'orange' },
        urgente: { label: 'Urgente', icon: '🚨', color: 'red' },
      },
    },
  },
  
  // Configurações específicas do condomínio
  condominium: {
    totalUnits: 120,
    structure: 'horizontal',  // horizontal | vertical
    type: 'casas',           // casas | apartamentos
    blocks: [
      { id: 1, name: 'Bloco A', units: 30, type: 'duplex' },
      { id: 2, name: 'Bloco B', units: 30, type: 'duplex' },
      { id: 3, name: 'Bloco C', units: 30, type: 'duplex' },
      { id: 4, name: 'Bloco D', units: 30, type: 'duplex' },
    ],
    amenities: [
      { id: 'piscina', name: 'Piscina', icon: '🏊' },
      { id: 'churrasqueira', name: 'Churrasqueira', icon: '🍖' },
      { id: 'salao', name: 'Salão de Festas', icon: '🎉' },
      { id: 'quadra', name: 'Quadra Poliesportiva', icon: '⚽' },
      { id: 'playground', name: 'Playground', icon: '🎠' },
      { id: 'academia', name: 'Academia', icon: '🏋️' },
    ],
  },
  
  // Branding
  branding: {
    logoUrl: '/assets/logos/pinheiro-park.svg',
    logoWhiteUrl: '/assets/logos/pinheiro-park-white.svg',
    poweredByUrl: '/assets/logos/condomix-badge.svg',
    favicon: '/favicon-pinheiropark.ico',
    
    // Metadados
    meta: {
      title: 'Pinheiro Park - Gestão Inteligente',
      description: 'Sistema de gestão condominial do Pinheiro Park. Transparência, participação e eficiência.',
      keywords: ['condomínio', 'gestão', 'pinheiro park', 'teresina', 'transparência'],
    },
    
    // Redes sociais (futuro)
    social: {
      instagram: '',
      facebook: '',
      whatsapp: '',
    },
  },
};

// Exportar como default para facilitar importação
export default pinheiroParkTheme;

// Type-safe exports
export type Theme = typeof pinheiroParkTheme;
export type ColorPalette = typeof pinheiroParkTheme.colors;
export type Typography = typeof pinheiroParkTheme.typography;
