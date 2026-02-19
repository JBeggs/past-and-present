/// <reference types="cypress" />

describe('About', () => {
  beforeEach(() => {
    cy.visit('/about');
  });

  it('loads about page with hero visible', () => {
    cy.get('[data-cy="about-hero"]').should('be.visible');
    cy.contains('Our Story').should('be.visible');
    cy.contains('Where the charm of yesterday meets the convenience of today').should('be.visible');
  });

  it('shows section navigation when sections exist', () => {
    cy.get('[data-cy="about-nav"]').should('be.visible');
    cy.get('a[href="#story"]').should('exist');
  });

  it('shows key sections', () => {
    cy.get('#story').should('exist');
    cy.get('#investors').should('exist');
    cy.get('#how-it-works').should('exist');
    cy.get('#believe').should('exist');
  });

  it('has CTA with Shop Now link', () => {
    cy.get('[data-cy="about-cta"]').should('be.visible');
    cy.get('[data-cy="about-cta"] a[href="/products"]').should('contain', 'Shop Now');
  });

  it('nav links work', () => {
    cy.get('a[href="#story"]').first().click();
    cy.get('#story').should('be.visible');
  });
});
