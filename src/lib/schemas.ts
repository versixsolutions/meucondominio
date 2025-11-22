import { z } from 'zod'

// Schema de Cadastro de Usuário
export const signupSchema = z.object({
  fullName: z.string()
    .min(3, 'Nome completo deve ter pelo menos 3 caracteres')
    .transform(name => name.trim().replace(/\s+/g, ' ')), // Sanitização
  
  email: z.string()
    .email('Formato de e-mail inválido')
    .toLowerCase(),
  
  password: z.string()
    .min(6, 'A senha deve ter no mínimo 6 caracteres'),
    // Pode-se adicionar .regex(/[A-Z]/, 'Precisa de uma maiúscula') para mais segurança
  
  phone: z.string()
    .min(14, 'Telefone incompleto') // (XX) XXXXX-XXXX
    .max(15, 'Telefone inválido'),
  
  unitNumber: z.string()
    .min(1, 'Número da unidade é obrigatório')
    .regex(/^[0-9A-Za-z-]+$/, 'Unidade deve conter apenas letras, números e traços'),
  
  condominioId: z.string()
    .min(1, 'Selecione um condomínio'),
    
  residentType: z.enum(['titular', 'inquilino', 'morador']),
  
  isWhatsapp: z.boolean()
})

// Tipo inferido do schema para uso no TypeScript
export type SignupFormData = z.infer<typeof signupSchema>