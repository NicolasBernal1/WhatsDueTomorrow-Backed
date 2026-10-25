export interface CalendarTestContext {
  email: string;
  password: string;
  token: string;
  subjectId: number;
}

let cachedCalendarContext: CalendarTestContext | null = null;

const BACKEND_URL = process.env.BACKEND_BASE_URL || 'https://whatsduetomorrow-backed.onrender.com';

export async function getOrCreateCalendarContext(): Promise<CalendarTestContext> {
  if (cachedCalendarContext) {
    return cachedCalendarContext;
  }

  const ts = Math.floor(Math.random() * 1000000);
  const email = `alicia.f23.${ts}@example.com`;
  const password = 'Password123!';

  // 1. Registro
  await fetch(`${BACKEND_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Alicia Calendario', email, password }),
  });

  // 2. Login
  const loginRes = await fetch(`${BACKEND_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const loginData = await loginRes.json();
  const token = loginData.data.token;

  // 3. Crear Asignatura
  await fetch(`${BACKEND_URL}/subjects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: 'Cálculo y Álgebra F23', professor: 'Profesor Euler' }),
  });

  const subjectsRes = await fetch(`${BACKEND_URL}/subjects`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const subjectsData = await subjectsRes.json();
  const subjectId = subjectsData.data[0].id;

  // 4. Crear Entrega para evento en calendario
  await fetch(`${BACKEND_URL}/assignments/subject/${subjectId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      title: 'Taller de Vectores F23',
      description: 'Entrega para validación de calendario .ics',
      dueDate: new Date(Date.now() + 86400000).toISOString(),
    }),
  });

  cachedCalendarContext = { email, password, token, subjectId };
  return cachedCalendarContext;
}
