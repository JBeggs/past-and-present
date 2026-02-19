/// <reference types="cypress" />

describe('Profile', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/profile');
  });

  it('shows profile when logged in', () => {
    cy.get('[data-cy="profile-content"]').should('be.visible');
  });

  it('displays profile form fields', () => {
    cy.get('[data-cy="profile-content"]').within(() => {
      cy.get('input, textarea').should('exist');
    });
  });

  it('shows orders section', () => {
    cy.contains('Order History').should('be.visible');
  });
});
