/**
 * E2E Test: Votações (Voting) Feature
 * Tests voting functionality including:
 * - Voting on active votações
 * - Duplicate vote prevention
 * - Status transitions
 * - Vote results display
 */

describe('Votações Feature', () => {
  beforeEach(() => {
    // Assume user is logged in
    cy.visit('/votacoes')
  })

  it('should load votações list', () => {
    cy.get('[data-testid="votacoes-list"]').should('exist')
    cy.get('[data-testid="votacao-card"]').should('have.length.greaterThan', 0)
  })

  it('should filter votações by status', () => {
    cy.get('[data-testid="status-filter"]').select('ativa')
    cy.get('[data-testid="votacao-card"]').each(($card) => {
      cy.wrap($card).should('contain', 'Ativa')
    })
  })

  it('should cast vote on active votação', () => {
    // Find an active votação
    cy.get('[data-testid="votacao-card"]').filter(':contains("Ativa")').first().within(() => {
      cy.get('[data-testid="vote-option"]').first().click()
      cy.get('[data-testid="confirm-vote-button"]').click()
    })

    // Verify success notification
    cy.contains('✓ Voto registrado com sucesso').should('be.visible')
  })

  it('should prevent duplicate voting', () => {
    // Try to vote twice on same votação
    cy.get('[data-testid="votacao-card"]').filter(':contains("Ativa")').first().within(() => {
      cy.get('[data-testid="vote-option"]').first().click()
      cy.get('[data-testid="confirm-vote-button"]').click()
    })

    cy.contains('✓ Voto registrado com sucesso').should('be.visible')

    // Refresh and try again
    cy.reload()
    cy.get('[data-testid="votacao-card"]').filter(':contains("Ativa")').first().within(() => {
      cy.get('[data-testid="vote-button"]').should('be.disabled')
        .or.contain('Votado')
    })
  })

  it('should display vote results', () => {
    cy.get('[data-testid="votacao-card"]').first().within(() => {
      cy.get('[data-testid="results-button"]').click()
    })

    cy.get('[data-testid="vote-results"]').should('be.visible')
    cy.get('[data-testid="result-option"]').should('have.length.greaterThan', 0)
  })

  it('should show percentage in results', () => {
    cy.get('[data-testid="votacao-card"]').first().within(() => {
      cy.get('[data-testid="results-button"]').click()
    })

    cy.get('[data-testid="result-percentage"]').each(($percent) => {
      cy.wrap($percent).invoke('text').should('match', /\d+%/)
    })
  })

  it('should not allow voting on encerrada votação', () => {
    cy.get('[data-testid="votacao-card"]').filter(':contains("Encerrada")').first().within(() => {
      cy.get('[data-testid="vote-button"]').should('be.disabled')
      cy.get('[data-testid="vote-button"]').should('contain', 'Encerrada')
    })
  })
})
