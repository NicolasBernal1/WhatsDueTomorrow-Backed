// Helper commands for backend API testing in Cypress against deployed Render service

Cypress.Commands.add('registerAndLogin', (userOverrides = {}) => {
  const randomSuffix = Math.floor(Math.random() * 1000000);
  const user = {
    name: userOverrides.name || 'Estudiante Cypress',
    email: userOverrides.email || `estudiante_${randomSuffix}@example.com`,
    password: userOverrides.password || 'Password123!',
    ...userOverrides,
  };

  return cy.request({
    method: 'POST',
    url: '/auth/register',
    body: user,
    failOnStatusCode: false,
  }).then((registerRes) => {
    return cy.request({
      method: 'POST',
      url: '/auth/login',
      body: {
        email: user.email,
        password: user.password,
      },
    }).then((loginRes) => {
      expect(loginRes.status).to.be.oneOf([200, 201]);
      const token = loginRes.body.data.token;
      return {
        token,
        user: loginRes.body.data.user || user,
      };
    });
  });
});
