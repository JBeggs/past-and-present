/// <reference types="cypress" />

describe('Home', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('loads home page with hero visible', () => {
    cy.get('[data-cy="home-hero"]').should('be.visible');
    cy.contains('Where Past Meets Present').should('be.visible');
  });

  it('shows featured products when available', () => {
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="home-featured"]').length > 0) {
        cy.get('[data-cy="home-featured"]').should('be.visible');
      }
    });
  });

  it('shows articles when available', () => {
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="home-articles"]').length > 0) {
        cy.get('[data-cy="home-articles"]').should('be.visible');
      }
    });
  });

  it('nav links work', () => {
    cy.get('a[href="/products"]').first().click();
    cy.url().should('include', '/products');
    cy.visit('/');
    cy.get('a[href="/articles"]').first().click();
    cy.url().should('include', '/articles');
  });
});
