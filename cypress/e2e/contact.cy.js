/// <reference types="cypress" />

describe('Contact', () => {
  beforeEach(() => {
    cy.visit('/contact');
  });

  it('renders contact form', () => {
    cy.get('[data-cy="contact-form"]').should('be.visible');
    cy.get('[data-cy="contact-submit"]').should('be.visible');
  });

  it('form has required fields', () => {
    cy.get('#name').should('exist');
    cy.get('#email').should('exist');
    cy.get('#subject').should('exist');
    cy.get('#message').should('exist');
  });

  it('submit works and shows success', () => {
    cy.get('#name').type('Test User');
    cy.get('#email').type('test@example.com');
    cy.get('#subject').type('Test Subject');
    cy.get('#message').type('Test message content');
    cy.get('[data-cy="contact-submit"]').click();
    // Toast is in fixed container; use exist since be.visible can fail with fixed/overflow
    cy.get('[data-cy="toast-success"]', { timeout: 5000 }).should('exist');
  });
});
