describe('Unsent and Unstable', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  // FLAG: luv-letter-delivery
  // ON  → "The Letter That Arrived" — Darcy's letter reaches Longbourn, test PASSES
  // OFF → "The Letter That Never Arrived" — letter lost, test SKIPPED in the story
  // This Cypress test asserts the flag-ON narrative. Toggling luv-letter-delivery
  // OFF in LaunchDarkly will cause this test to fail — that's the point.
  it('Chapter I - The Letter', () => {
    cy.get('.chapter-card').eq(0).within(() => {
      cy.get('h2').should('contain', 'Chapter I');
      cy.get('.flag-badge').should('contain', 'luv-letter-delivery');
      cy.get('.scene').should('contain', "Darcy's letter arrives at Longbourn");
      cy.get('.quote').should('contain', 'selfish being all my life');
      cy.get('.test-indicator').should('contain', 'letter.delivered');
    });
  });

  // FLAG: luv-proposal-style
  // ON  → "The Proposal That Passed Code Review" — second proposal at Pemberley,
  //        elegant, accepted, test PASSES
  // OFF → "The Proposal That Failed Code Review" — first proposal at Hunsford,
  //        arrogant, rejected, test FAILS in the story
  // This Cypress test asserts the flag-ON narrative. Toggle luv-proposal-style
  // OFF to watch it fail.
  it('Chapter II - The Proposal', () => {
    cy.get('.chapter-card').eq(1).within(() => {
      cy.get('h2').should('contain', 'Chapter II');
      cy.get('.flag-badge').should('contain', 'luv-proposal-style');
      cy.get('.scene').should('contain', 'Pemberley');
      cy.get('.quote').should('contain', 'too generous to trifle');
      cy.get('.test-indicator').should('contain', 'proposal.response');
    });
  });

  // FLAG: luv-ball-invitation (50/50 random rollout — flaky by design)
  // ON  → "The Invitation That Arrived" — footman delivers it, test PASSES
  // OFF → "The Invitation That Got Lost" — footman stops at the pub, test FAILS
  // Both outcomes mention the footman and invitation.delivered, so this test
  // stays green either way. The flag dot is always gold and flickering.
  it('Chapter III - The Flaky Invitation', () => {
    cy.get('.chapter-card').eq(2).within(() => {
      cy.get('h2').should('contain', 'Chapter III');
      cy.get('.flag-badge').should('contain', 'luv-ball-invitation');
      cy.get('.scene').should('contain', 'footman');
      cy.get('.test-indicator').should('contain', 'invitation.delivered');
      cy.get('.flag-dot').should('have.class', 'flaky');
    });
  });

  // FLAG: luv-staging-chaos
  // ON  → "The Staging Environment Ball" — chaos mode, Mr. Collins married Darcy,
  //        Kubernetes pod lost, test FAILS in the story
  // OFF → "The Staging Environment" — all services at peace, test PASSES
  // Both outcomes describe a "staging environment" and reference "staging" in
  // the test indicator, so this test holds regardless of chaos flag state.
  it('Chapter IV - The Staging Environment', () => {
    cy.get('.chapter-card').eq(3).within(() => {
      cy.get('h2').should('contain', 'Chapter IV');
      cy.get('.flag-badge').should('contain', 'luv-staging-chaos');
      cy.get('.scene').should('contain', 'staging environment');
      cy.get('.test-indicator').should('contain', 'staging');
      cy.get('.quote').should('exist');
    });
  });

  // No app flag controls this chapter — it always renders all 4 test results.
  // Verifies the terminal-style dashboard is present with the pytest command,
  // one result row per chapter, and a summary line.
  it('Chapter V - The Test Results Dashboard', () => {
    cy.get('.test-dashboard').within(() => {
      cy.get('h3').should('contain', 'Chapter V');
      cy.contains('pytest tests/test_regency.py').should('exist');
      cy.get('.test-line').should('have.length', 4);
      cy.get('.test-summary').should('exist');
    });
  });
});
