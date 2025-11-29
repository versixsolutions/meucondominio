/**
 * E2E Test: Comunicados (Announcements) Feature
 * Tests announcements functionality including:
 * - Loading comunicados list
 * - Filtering and sorting
 * - Push notification subscriptions
 * - Admin creation (for admin users)
 */

describe('Comunicados Feature', () => {
  beforeEach(() => {
    // Assume user is logged in
    cy.visit('/comunicados')
  })

  it('should load comunicados list', () => {
    cy.get('[data-testid="comunicados-list"]').should('exist')
    cy.get('[data-testid="comunicado-card"]').should('have.length.greaterThan', 0)
  })

  it('should sort comunicados by date (newest first)', () => {
    cy.get('[data-testid="sort-button"]').click()
    cy.get('[data-testid="sort-option-newest"]').click()

    // Verify first card is most recent
    cy.get('[data-testid="comunicado-card"]').first().within(() => {
      cy.get('[data-testid="comunicado-date"]').invoke('text').then((firstDate) => {
        cy.get('[data-testid="comunicado-card"]').eq(1).within(() => {
          cy.get('[data-testid="comunicado-date"]').invoke('text').then((secondDate) => {
            const first = new Date(firstDate)
            const second = new Date(secondDate)
            expect(first.getTime()).toBeGreaterThanOrEqual(second.getTime())
          })
        })
      })
    })
  })

  it('should filter comunicados by category', () => {
    cy.get('[data-testid="category-filter"]').select('Manutenção')
    cy.get('[data-testid="comunicado-card"]').each(($card) => {
      cy.wrap($card).should('contain', 'Manutenção')
    })
  })

  it('should display comunicado detail', () => {
    cy.get('[data-testid="comunicado-card"]').first().click()
    cy.get('[data-testid="comunicado-detail"]').should('be.visible')
    cy.get('[data-testid="comunicado-title"]').should('exist')
    cy.get('[data-testid="comunicado-body"]').should('exist')
  })

  it('should subscribe to push notifications', () => {
    cy.get('[data-testid="notification-toggle"]').click()
    cy.contains('Notificações ativadas').should('be.visible')

    // Verify toggle state is saved
    cy.reload()
    cy.get('[data-testid="notification-toggle"]').should('be.checked')
  })

  it('should search comunicados by title', () => {
    const searchTerm = 'manutenção'
    cy.get('[data-testid="search-input"]').type(searchTerm)

    cy.get('[data-testid="comunicado-card"]').each(($card) => {
      cy.wrap($card).invoke('text').should('include.oneOf', ['manutenção', 'Manutenção'])
    })
  })

  it('should show empty state when no results', () => {
    cy.get('[data-testid="search-input"]').type('xyz12345nonexistent')
    cy.contains('Nenhum comunicado encontrado').should('be.visible')
  })

  it('should allow admin to create comunicado', () => {
    // Check if user is admin (navigate to admin section)
    cy.get('[data-testid="admin-menu"]').click()
    cy.get('[data-testid="create-comunicado-link"]').click()

    cy.get('[data-testid="comunicado-form"]').should('be.visible')
    cy.get('[data-testid="comunicado-title-input"]').type('Test Announcement')
    cy.get('[data-testid="comunicado-body-input"]').type('This is a test announcement')
    cy.get('[data-testid="comunicado-category-select"]').select('Geral')
    cy.get('[data-testid="submit-button"]').click()

    cy.contains('Comunicado criado com sucesso').should('be.visible')
  })
})
