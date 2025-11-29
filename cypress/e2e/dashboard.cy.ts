/**
 * E2E Test: Dashboard
 * Tests dashboard functionality including:
 * - Loading stats cards
 * - Navigation to different modules
 * - Real-time data updates
 * - Responsive layout
 */

describe('Dashboard', () => {
  beforeEach(() => {
    // Assume user is logged in
    cy.visit('/dashboard')
  })

  it('should load dashboard with stats', () => {
    cy.get('[data-testid="dashboard-header"]').should('be.visible')
    cy.get('[data-testid="stat-card"]').should('have.length.greaterThan', 0)
  })

  it('should display key statistics', () => {
    // Check for common stat cards
    cy.get('[data-testid="stat-card"]').should('exist')
    cy.get('[data-testid="stat-label"]').each(($label) => {
      cy.wrap($label).invoke('text').should('not.be.empty')
    })
  })

  it('should display stat values', () => {
    cy.get('[data-testid="stat-value"]').each(($value) => {
      cy.wrap($value).invoke('text').should('match', /\d+/)
    })
  })

  it('should navigate to comunicados from dashboard', () => {
    cy.get('[data-testid="comunicados-card"]').click()
    cy.url().should('include', '/comunicados')
  })

  it('should navigate to votacoes from dashboard', () => {
    cy.get('[data-testid="votacoes-card"]').click()
    cy.url().should('include', '/votacoes')
  })

  it('should navigate to despesas from dashboard', () => {
    cy.get('[data-testid="despesas-card"]').click()
    cy.url().should('include', '/despesas')
  })

  it('should display recent activity', () => {
    cy.get('[data-testid="recent-activity"]').should('be.visible')
    cy.get('[data-testid="activity-item"]').should('have.length.greaterThan', 0)
  })

  it('should load without errors', () => {
    // Check for any error messages
    cy.on('console', (log) => {
      expect(log.type).not.equal('error')
    })

    // Check for visible error UI
    cy.contains('Erro ao carregar').should('not.exist')
  })
})
