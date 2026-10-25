export interface AcademicLoadTestContext {
  email: string;
  password: string;
  token: string;
}

let cachedAcademicLoadContext: AcademicLoadTestContext | null = null;

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
      // ignore
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  if (!token) {
    throw new Error(`Failed to obtain JWT token for ${email}`);
  }
  return token;
}

export async function getOrCreateAcademicLoadContext(): Promise<AcademicLoadTestContext> {
  if (cachedAcademicLoadContext) {
    return cachedAcademicLoadContext;
  }

  const ts = Math.floor(Math.random() * 1000000);
  const email = `alicia.f26.${ts}@example.com`;
  const password = 'Password123!';

  // 1. Registro
  await fetch(`${BACKEND_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Alicia Carga Academica', email, password }),
  });

  // 2. Login
  const token = await loginWithRetry(email, password);

  // 3. Crear 3 asignaturas con 5 créditos cada una para totalizar 15 créditos (Carga balanceada)
  const initialSubjects = [
    { name: 'Calculo Vectorial', professor: 'Profesor Gauss', credits: 5 },
    { name: 'Estructuras de Datos', professor: 'Profesor Knuth', credits: 5 },
    { name: 'Fisica Magnetica', professor: 'Profesor Maxwell', credits: 5 },
  ];

  for (const sub of initialSubjects) {
    await fetch(`${BACKEND_URL}/subjects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(sub),
    });
  }

  cachedAcademicLoadContext = { email, password, token };
  return cachedAcademicLoadContext;
}
