/// <reference types="cypress" />

describe('Checkout Success', () => {
  it('shows success page when visiting with orderId', () => {
    cy.visit('/checkout/success?orderId=TEST-123');
    cy.get('[data-cy="checkout-success-content"]').should('be.visible');
    cy.contains('Order Successfully Placed').should('be.visible');
    cy.contains('TEST-123').should('be.visible');
  });

  it('has links to continue shopping and return home', () => {
    cy.visit('/checkout/success?orderId=TEST-456');
    cy.get('a[href="/products"]').should('be.visible');
    cy.get('a[href="/"]').should('be.visible');
  });
});
