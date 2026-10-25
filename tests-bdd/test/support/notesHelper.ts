export interface NotesTestContext {
  email: string;
  password: string;
  token: string;
  subjectId: number;
  noteId?: number;
}

export interface NotesAttackerContext {
  email: string;
  password: string;
  token: string;
}

let cachedNotesContext: NotesTestContext | null = null;
let cachedNotesAttacker: NotesAttackerContext | null = null;

const BACKEND_URL = process.env.BACKEND_BASE_URL || 'https://whatsduetomorrow-backed.onrender.com';

export async function getOrCreateNotesContext(): Promise<NotesTestContext> {
  if (cachedNotesContext) {
    return cachedNotesContext;
  }

  const ts = Math.floor(Math.random() * 1000000);
  const email = `alicia.f24.${ts}@example.com`;
  const password = 'Password123!';

  // 1. Registro
  await fetch(`${BACKEND_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Alicia Bitacora', email, password }),
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
    body: JSON.stringify({ name: 'Cálculo Multivariable F24', professor: 'Dr Gauss' }),
  });

  const subjectsRes = await fetch(`${BACKEND_URL}/subjects`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const subjectsData = await subjectsRes.json();
  const subjectId = subjectsData.data[0].id;

  cachedNotesContext = { email, password, token, subjectId };
  return cachedNotesContext;
}

export async function getOrCreateNotesAttacker(): Promise<NotesAttackerContext> {
  if (cachedNotesAttacker) {
    return cachedNotesAttacker;
  }

  const ts = Math.floor(Math.random() * 1000000);
  const email = `atacante.f24.${ts}@example.com`;
  const password = 'Password123!';

  await fetch(`${BACKEND_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Atacante Bitacora', email, password }),
  });

  const loginRes = await fetch(`${BACKEND_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const loginData = await loginRes.json();
  const token = loginData.data.token;

  cachedNotesAttacker = { email, password, token };
  return cachedNotesAttacker;
}

export async function createNoteDirectly(title: string, content: string, linkUrl?: string): Promise<number> {
  const ctx = await getOrCreateNotesContext();
  const res = await fetch(`${BACKEND_URL}/subjects/${ctx.subjectId}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ctx.token}` },
    body: JSON.stringify({ title, content, linkUrl }),
  });
  const data = await res.json();
  return data.data.id;
}
