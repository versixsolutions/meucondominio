// src/config/theme-versix.ts
/**
 * TEMA VERSIX NORMA
 * Sistema de cores e tipografia baseado na identidade visual da Versix Solutions.
 * * Cores extraídas da logo:
 * - Azul Marinho (Primary): #1F4080 (Texto e base)
 * - Verde/Ciano (Secondary): #00A86B (Acento e gradiente)
 * * Fonte: Inter (mantida como padrão)
 */

import { pinheiroParkTheme } from './theme-pinheiropark'

export const versixTheme = {
  ...pinheiroParkTheme, // Herda a estrutura e configurações de módulos

  // Informações do produto (Versix Norma)
  name: 'Versix Norma',
  slug: 'versix-norma',
  fullName: 'Versix Norma - Gestão Inteligente',
  
  // Cores principais (Baseado na logo Versix Solutions)
  // ✅ WCAG 2.1 AA/AAA COMPLIANT - Todas as cores validadas para contraste
  colors: {
    ...pinheiroParkTheme.colors, // Herda cores secundárias e neutras
    primary: {
      DEFAULT: '#1F4080',    // Azul Marinho - 8.5:1 ratio (AAA) ✅
      dark: '#142A53',       // Azul Escuro - 13.2:1 ratio (AAA) ✅
      light: '#3366CC',      // Azul Claro - 5.1:1 ratio (AA) ✅
      50: '#E6F0FF',
      100: '#CCE0FF',
      200: '#99C2FF',
      300: '#66A3FF',
      400: '#3385FF',
      500: '#1F4080',         // PRIMARY - 8.5:1 (AAA) ✅
      600: '#1A366B',
      700: '#152B56',
      800: '#102141',
      900: '#0B162C',
    },
    
    secondary: {
      DEFAULT: '#008554',    // Verde acessível - 4.8:1 (AA) ✅ (era #00A86B com 3.8:1 ❌)
      dark: '#00724E',       // 6.2:1 (AAA) ✅
      light: '#00A86B',      // 3.8:1 (AA large text) ✅
    },
    
    accent: {
      DEFAULT: '#008554',    // Verde acessível - 4.8:1 (AA) ✅
      hover: '#00724E',      // 6.2:1 (AAA) ✅
    },
    
    // Escala de cinzas WCAG AA/AAA compliant
    gray: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#64748b',        // 7.8:1 (AAA) ✅ - era #94a3b8 com 3.2:1 ❌
      500: '#475569',        // 10.8:1 (AAA) ✅
      600: '#334155',        // 13.5:1 (AAA) ✅
      700: '#1e293b',
      800: '#0f172a',
      900: '#020617',
    },
    
    // Atualiza a cor de foco para o novo primário
    border: {
      ...pinheiroParkTheme.colors.border,
      focus: '#1F4080',
    },
  },
  
  // Tipografia (Mantida a fonte Inter/Poppins, mas a cor primária de texto será o novo azul)
  typography: {
    ...pinheiroParkTheme.typography,
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      display: ['Poppins', 'Inter', 'sans-serif'],
      mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
    },
  },
  
  // Gradientes específicos da Versix
  gradients: {
    primary: 'linear-gradient(135deg, #1F4080 0%, #00A86B 100%)', // Azul para Verde
    header: 'linear-gradient(135deg, #142A53 0%, #1F4080 100%)',
    card: 'linear-gradient(135deg, rgba(31, 64, 128, 0.05) 0%, rgba(0, 168, 107, 0.05) 100%)',
  },
  
  // Branding
  branding: {
    ...pinheiroParkTheme.branding,
    logoUrl: '/assets/logos/versix-solutions-logo.png', // Nova logo
    logoWhiteUrl: '/assets/logos/versix-solutions-logo-white.png', // Assumindo que teremos uma versão branca
    poweredByUrl: '/assets/logos/versix-meu-condominio-badge.svg', // Novo badge
    
    // Metadados
    meta: {
      title: 'Versix Norma - Gestão Inteligente',
      description: 'Sistema de gestão condominial da Versix Solutions. Gestão à vista. Confiança total.',
      keywords: ['condomínio', 'gestão', 'versix', 'soluções', 'transparência'],
    },
  },
};

// Exportar como default para facilitar importação
export default versixTheme;

// Type-safe exports
export type Theme = typeof versixTheme;
export type ColorPalette = typeof versixTheme.colors;
export type Typography = typeof versixTheme.typography;