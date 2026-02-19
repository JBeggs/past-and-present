/// <reference types="cypress" />

describe('Articles', () => {
  beforeEach(() => {
    cy.visit('/articles');
  });

  it('loads articles page', () => {
    cy.contains('Stories & Inspiration').should('be.visible');
  });

  it('shows articles list when articles exist', () => {
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="articles-list"]').length > 0) {
        cy.get('[data-cy="articles-list"]').should('be.visible');
      }
    });
  });

  it('navigates to article detail when article link is clicked', () => {
    cy.get('body').then(($body) => {
      const articleLink = $body.find('a[href^="/articles/"]').first();
      if (articleLink.length > 0) {
        const href = articleLink.attr('href');
        cy.get(`a[href="${href}"]`).first().click();
        cy.url({ timeout: 10000 }).should('include', '/articles/');
        cy.get('[data-cy="article-title"]').should('be.visible');
      }
    });
  });
});
