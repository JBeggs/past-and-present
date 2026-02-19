// ***********************************************************
// Support file for E2E tests
// Past and Present uses auth_token, refresh_token, company_id (separate keys)
// ***********************************************************

Cypress.Commands.add('login', (username, password) => {
  const user = username || Cypress.env('testUser');
  const pass = password || Cypress.env('testPassword');
  const apiUrl = Cypress.env('apiUrl');
  const companySlug = Cypress.env('companySlug') || 'past-and-present';

  cy.session([user, pass], () => {
    cy.request('POST', `${apiUrl}/auth/login/`, {
      username: user,
      password: pass,
      company_slug: companySlug,
    }).then((res) => {
      expect(res.status).to.eq(200);
      cy.visit('/');
      cy.window().then((win) => {
        win.localStorage.setItem('auth_token', res.body.access);
        win.localStorage.setItem('refresh_token', res.body.refresh);
        if (res.body.company?.id) {
          win.localStorage.setItem('company_id', res.body.company.id);
        }
      });
    });
  });
});
