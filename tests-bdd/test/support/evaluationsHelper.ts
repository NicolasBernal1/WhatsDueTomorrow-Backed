export interface EvaluationsTestContext {
  email: string;
  password: string;
  token: string;
  subjectId: number;
}

export interface EvaluationsAttackerContext {
  email: string;
  password: string;
  token: string;
}

let cachedEvaluationsContext: EvaluationsTestContext | null = null;
let cachedEvaluationsAttacker: EvaluationsAttackerContext | null = null;

const BACKEND_URL = process.env.BACKEND_BASE_URL || 'https://whatsduetomorrow-backed.onrender.com';

async function loginWithRetry(email: string, password: string): Promise<string> {
  let token = '';
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const loginRes = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const loginData = await loginRes.json();
      if (loginData?.data?.token) {
        token = loginData.data.token;
        break;
      }
    } catch {
      // ignore and retry
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  if (!token) {
    throw new Error(`Failed to obtain JWT token for ${email}`);
  }
  return token;
}

export async function getOrCreateEvaluationsContext(): Promise<EvaluationsTestContext> {
  if (cachedEvaluationsContext) {
    return cachedEvaluationsContext;
  }

  const ts = Math.floor(Math.random() * 1000000);
  const email = `alicia.f25.${ts}@example.com`;
  const password = 'Password123!';

  // 1. Registro
  await fetch(`${BACKEND_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Alicia Calculadora', email, password }),
  });

  // 2. Login
  const token = await loginWithRetry(email, password);

  // 3. Crear Asignatura
  await fetch(`${BACKEND_URL}/subjects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: 'Física Ondulatoria F25', professor: 'Dra Curie' }),
  });

  const subjectsRes = await fetch(`${BACKEND_URL}/subjects`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const subjectsData = await subjectsRes.json();
  const subjectId = subjectsData.data[0].id;

  cachedEvaluationsContext = { email, password, token, subjectId };
  return cachedEvaluationsContext;
}

export async function getOrCreateEvaluationsAttacker(): Promise<EvaluationsAttackerContext> {
  if (cachedEvaluationsAttacker) {
    return cachedEvaluationsAttacker;
  }

  const ts = Math.floor(Math.random() * 1000000);
  const email = `carlos.f25.attacker.${ts}@example.com`;
  const password = 'Password123!';

  await fetch(`${BACKEND_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Carlos Atacante', email, password }),
  });

  const token = await loginWithRetry(email, password);

  cachedEvaluationsAttacker = { email, password, token };
  return cachedEvaluationsAttacker;
}

export async function ensureInitialEvaluation(context: EvaluationsTestContext): Promise<void> {
  try {
    const getRes = await fetch(`${BACKEND_URL}/subjects/${context.subjectId}/evaluations`, {
      headers: { Authorization: `Bearer ${context.token}` },
    });
    const getData = await getRes.json();
    const evals = getData.data?.evaluations || [];

    if (evals.length === 0) {
      await fetch(`${BACKEND_URL}/subjects/${context.subjectId}/evaluations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${context.token}`,
        },
        body: JSON.stringify({
          name: 'Primer Examen Parcial Previo',
          weight: 30,
          score: 4.5,
        }),
      });
    }
  } catch (err) {
    console.error('ensureInitialEvaluation error:', err);
  }
}
