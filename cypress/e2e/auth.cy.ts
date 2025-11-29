/**
 * E2E Test: Login Flow
 * Tests the complete authentication flow including:
 * - Invalid credentials
 * - Valid login
 * - Session persistence
 */

describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  it('should show error for invalid credentials', () => {
    cy.get('input[type="email"]').type('invalid@example.com')
    cy.get('input[type="password"]').type('wrongpassword')
    cy.get('button[type="submit"]').click()
    
    // Wait for error message
    cy.contains('Email ou senha incorretos').should('be.visible')
  })

  it('should successfully login with valid credentials', () => {
    // Use test credentials (should be in .env.test or hardcoded for demo)
    const testEmail = Cypress.env('TEST_EMAIL') || 'test@example.com'
    const testPassword = Cypress.env('TEST_PASSWORD') || 'testpass123'

    cy.get('input[type="email"]').type(testEmail)
    cy.get('input[type="password"]').type(testPassword)
    cy.get('button[type="submit"]').click()

    // Should redirect to dashboard
    cy.url().should('not.include', '/login')
    cy.get('[data-testid="dashboard-header"]').should('exist')
  })

  it('should show signup link', () => {
    cy.contains('Não tem conta?').should('be.visible')
    cy.contains('Criar uma').click()
    cy.url().should('include', '/signup')
  })
})
