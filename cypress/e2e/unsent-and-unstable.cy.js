describe('Unsent and Unstable', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Chapter I - The Letter', () => {
    cy.get('.chapter-card').eq(0).within(() => {
      cy.get('h2').should('contain', 'Chapter I');
      cy.get('.scene').should('exist');
      cy.get('.test-indicator').should('exist');
      cy.get('.flag-badge').should('contain', 'luv-letter-delivery');
    });
  });

  it('Chapter II - The Proposal', () => {
    cy.get('.chapter-card').eq(1).within(() => {
      cy.get('h2').should('contain', 'Chapter II');
      cy.get('.scene').should('exist');
      cy.get('.test-indicator').should('exist');
      cy.get('.flag-badge').should('contain', 'luv-proposal-style');
    });
  });

  it('Chapter III - The Flaky Invitation', () => {
    cy.get('.chapter-card').eq(2).within(() => {
      cy.get('h2').should('contain', 'Chapter III');
      cy.get('.scene').should('exist');
      cy.get('.test-indicator').should('exist');
      cy.get('.flag-badge').should('contain', 'luv-ball-invitation');
    });
  });

  it('Chapter IV - The Staging Environment', () => {
    cy.get('.chapter-card').eq(3).within(() => {
      cy.get('h2').should('contain', 'Chapter IV');
      cy.get('.scene').should('exist');
      cy.get('.test-indicator').should('exist');
      cy.get('.flag-badge').should('contain', 'luv-staging-chaos');
    });
  });

  it('Chapter V - The Test Results Dashboard', () => {
    cy.get('.test-dashboard').within(() => {
      cy.get('h3').should('contain', 'Chapter V');
      cy.get('.test-line').should('have.length', 4);
      cy.get('.test-summary').should('exist');
    });
  });
});
