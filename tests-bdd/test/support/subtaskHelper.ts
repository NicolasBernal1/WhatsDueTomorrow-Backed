export interface AssignmentTestContext {
  email: string;
  password: string;
  token: string;
  subjectId: number;
  assignmentId: number;
  subtaskId?: number;
}

export interface AttackerContext {
  email: string;
  password: string;
  token: string;
}

let cachedContext: AssignmentTestContext | null = null;
let cachedAttacker: AttackerContext | null = null;

const BACKEND_URL = process.env.BACKEND_BASE_URL || 'https://whatsduetomorrow-backed.onrender.com';

export async function getOrCreateAssignmentContext(): Promise<AssignmentTestContext> {
  if (cachedContext) {
    return cachedContext;
  }

  const ts = Math.floor(Math.random() * 1000000);
  const email = `alicia.f22.${ts}@example.com`;
  const password = 'Password123!';

  // 1. Registro
  await fetch(`${BACKEND_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Alicia Screenplay', email, password }),
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
    body: JSON.stringify({ name: 'Validación de Software F22', professor: 'Profesor Screenplay' }),
  });

  const subjectsRes = await fetch(`${BACKEND_URL}/subjects`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const subjectsData = await subjectsRes.json();
  const subjectId = subjectsData.data[0].id;

  // 4. Crear Entrega limpia sin subtareas previas
  await fetch(`${BACKEND_URL}/assignments/subject/${subjectId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      title: 'Proyecto Subtareas F22',
      description: 'Entrega para validación de avance porcentual',
      dueDate: new Date(Date.now() + 86400000).toISOString(),
    }),
  });

  const assignRes = await fetch(`${BACKEND_URL}/assignments/subject/${subjectId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const assignData = await assignRes.json();
  const assignmentId = assignData.data[0].id;

  cachedContext = { email, password, token, subjectId, assignmentId };
  return cachedContext;
}

export async function createSubtaskForAntiIdor(assignmentId: number, token: string): Promise<number> {
  const subRes = await fetch(`${BACKEND_URL}/assignments/${assignmentId}/subtasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ title: 'Subtarea Protegida Anti-IDOR' }),
  });
  const subData = await subRes.json();
  return subData.data.subtasks[subData.data.subtasks.length - 1].id;
}

export async function getOrCreateAttacker(): Promise<AttackerContext> {
  if (cachedAttacker) {
    return cachedAttacker;
  }

  const ts = Math.floor(Math.random() * 1000000);
  const email = `atacante.f22.${ts}@example.com`;
  const password = 'Password123!';

  await fetch(`${BACKEND_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Atacante Malicioso', email, password }),
  });

  const loginRes = await fetch(`${BACKEND_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const loginData = await loginRes.json();
  const token = loginData.data.token;

  cachedAttacker = { email, password, token };
  return cachedAttacker;
}
