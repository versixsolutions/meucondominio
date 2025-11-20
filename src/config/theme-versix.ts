// src/config/theme-versix.ts
/**
 * TEMA VERSIX MEU CONDOMINIO
 * Sistema de cores e tipografia baseado na identidade visual da Versix Solutions.
 * 
 * Cores extraídas da logo:
 * - Azul Marinho (Primary): #1F4080 (Texto e base)
 * - Verde/Ciano (Secondary): #00A86B (Acento e gradiente)
 * 
 * Fonte: Inter (mantida como padrão)
 */

import { pinheiroParkTheme } from './theme-pinheiropark'

export const versixTheme = {
  ...pinheiroParkTheme, // Herda a estrutura e configurações de módulos

  // Informações do produto (Versix Meu Condominio)
  name: 'Versix Meu Condominio',
  slug: 'versix-meu-condominio',
  fullName: 'Versix Meu Condominio - Gestão Inteligente',
  
  // Cores principais (Baseado na logo Versix Solutions)
  colors: {
    ...pinheiroParkTheme.colors, // Herda cores secundárias e neutras
    primary: {
      DEFAULT: '#1F4080',    // Azul Marinho - Tom principal (Texto Versix)
      dark: '#142A53',       // Azul Escuro - Hover/destaque
      light: '#3366CC',      // Azul Claro - CTAs/badges
      50: '#E6F0FF',
      100: '#CCE0FF',
      200: '#99C2FF',
      300: '#66A3FF',
      400: '#3385FF',
      500: '#1F4080',         // PRIMARY
      600: '#1A366B',
      700: '#152B56',
      800: '#102141',
      900: '#0B162C',
    },
    
    secondary: {
      DEFAULT: '#00A86B',    // Verde Jade - Acentos (Cor da borda da logo)
      dark: '#00724E',
      light: '#00D68F',
    },
    
    accent: {
      DEFAULT: '#00A86B',    // Mantém o verde como acento
      hover: '#00724E',
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
      title: 'Versix Meu Condominio - Gestão Inteligente',
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
