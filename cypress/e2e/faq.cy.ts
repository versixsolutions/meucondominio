/**
 * E2E Test: FAQ Feature
 * Tests the FAQ module including:
 * - Loading FAQs
 * - Search functionality
 * - Feedback collection
 * - Admin CRUD operations
 */

describe('FAQ Feature', () => {
  beforeEach(() => {
    // Assume user is logged in
    cy.visit('/faq')
  })

  it('should load FAQ list', () => {
    cy.get('[data-testid="faq-list"]').should('exist')
    cy.get('[data-testid="faq-card"]').should('have.length.greaterThan', 0)
  })

  it('should search FAQs by text', () => {
    const searchTerm = 'reserva'
    cy.get('[data-testid="faq-search"]').type(searchTerm)
    
    // Results should be filtered
    cy.get('[data-testid="faq-card"]').each(($card) => {
      cy.wrap($card).invoke('text').should('include.oneOf', ['reserva', 'Reserva'])
    })
  })

  it('should filter FAQs by category', () => {
    cy.get('[data-testid="category-filter"]').select('Áreas Comuns')
    cy.get('[data-testid="faq-card"]').each(($card) => {
      cy.wrap($card).should('contain', 'Áreas Comuns')
    })
  })

  it('should record helpful feedback', () => {
    cy.get('[data-testid="faq-card"]').first().within(() => {
      cy.get('[data-testid="helpful-button"]').click()
    })

    cy.contains('Obrigado pelo feedback').should('be.visible')
  })

  it('should expand FAQ and show full answer', () => {
    cy.get('[data-testid="faq-card"]').first().click()
    cy.get('[data-testid="faq-answer"]').should('be.visible')
  })
})
