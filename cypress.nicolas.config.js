const { defineConfig } = require("cypress");

// Config propio de las pruebas de Nicolás: no modifica cypress.config.js del equipo.
// Uso: cypress run --config-file cypress.nicolas.config.js
module.exports = defineConfig({
  video: false,
  screenshotOnRunFailure: false,
  defaultCommandTimeout: 15000,
  requestTimeout: 15000,
  responseTimeout: 15000,
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || "http://localhost:3000",
    specPattern: "cypress_nicolas/e2e/**/*.cy.js",
    supportFile: "cypress_nicolas/support/e2e.js",
    testIsolation: false,
  },
});
