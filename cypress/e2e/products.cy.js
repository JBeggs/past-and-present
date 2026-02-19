/// <reference types="cypress" />

describe('Products', () => {
  beforeEach(() => {
    cy.visit('/products');
  });

  it('loads products grid', () => {
    cy.get('[data-cy="products-grid"]', { timeout: 10000 }).should('be.visible');
  });

  it('navigates to product detail when product has slug', () => {
    cy.get('[data-cy="products-grid"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-cy="products-grid"] a[href^="/products/"]').first().click();
    cy.url().should('include', '/products/');
  });
});
