export const bearer = (token) => ({ Authorization: `Bearer ${token}` });

const unique = () => `${Date.now()}${Math.floor(Math.random() * 100000)}`;

export const createSubject = (token, overrides = {}) => {
  const name = overrides.name || `Materia ${unique()}`;
  const body = { name, professor: 'Prof. Cypress', credits: 3, ...overrides };
  return cy
    .request({ method: 'POST', url: '/subjects', headers: bearer(token), body })
    .then((res) => {
      expect(res.status).to.be.oneOf([200, 201]);
      return cy.request({ method: 'GET', url: '/subjects', headers: bearer(token) });
    })
    .then((res) => res.body.data.find((s) => s.name === body.name));
};

export const postClass = (token, body) =>
  cy.request({ method: 'POST', url: '/subjects/classes', headers: bearer(token), body, failOnStatusCode: false });

export const getClasses = (token) =>
  cy.request({ method: 'GET', url: '/subjects/classes', headers: bearer(token), failOnStatusCode: false });

export const patchClass = (token, id, body) =>
  cy.request({ method: 'PATCH', url: `/subjects/classes/${id}`, headers: bearer(token), body, failOnStatusCode: false });

export const deleteClass = (token, id) =>
  cy.request({ method: 'DELETE', url: `/subjects/classes/${id}`, headers: bearer(token), failOnStatusCode: false });

export const createClass = (token, subjectId, dayOfWeek, startTime, endTime) =>
  postClass(token, { dayOfWeek, startTime, endTime, subjectId })
    .then((res) => {
      expect(res.status, 'POST /subjects/classes').to.eq(201);
      return getClasses(token);
    })
    .then((res) => {
      const mine = res.body.data.filter(
        (c) =>
          c.subject.id === subjectId &&
          c.dayOfWeek === dayOfWeek &&
          c.startTime.startsWith(startTime) &&
          c.endTime.startsWith(endTime),
      );
      return mine[mine.length - 1];
    });

const variable = (nombre) => {
  try {
    if (typeof Cypress.expose === 'function') {
      const valor = Cypress.expose(nombre);
      if (valor !== undefined) return valor;
    }
  } catch (e) { /* no disponible */ }
  try { return Cypress.env(nombre); } catch (e) { return undefined; }
};

export const apiBudget = (fallback = 3000) => Number(variable('apiBudgetMs')) || fallback;

export const knownBug = (title, fn) =>
  (String(variable('skipKnownBugs')).toLowerCase() === 'true' ? it.skip : it)(`[DEFECTO] ${title}`, fn);

export const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const computeNextClass = (classes, now) => {
  const toMin = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const todayIndex = (now.getDay() + 6) % 7;
  const current = now.getHours() * 60 + now.getMinutes();
  for (let offset = 0; offset <= 7; offset++) {
    const day = DAYS[(todayIndex + offset) % 7];
    let candidates = classes.filter((c) => c.dayOfWeek.toLowerCase() === day);
    if (offset === 0) candidates = candidates.filter((c) => toMin(c.startTime) > current);
    candidates = candidates.slice().sort((a, b) => toMin(a.startTime) - toMin(b.startTime));
    if (candidates.length > 0) return candidates[0];
  }
  return null;
};
