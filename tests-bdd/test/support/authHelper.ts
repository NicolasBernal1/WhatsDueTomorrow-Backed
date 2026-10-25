export interface TestUserCredentials {
  email: string;
  password: string;
}

let cachedUser: TestUserCredentials | null = null;

export async function getOrCreateTestUser(): Promise<TestUserCredentials> {
  if (cachedUser) {
    return cachedUser;
  }

  const timestamp = Math.floor(Math.random() * 1000000);
  const email = `estudiante.screenplay.${timestamp}@example.com`;
  const password = 'Password123!';

  try {
    const response = await fetch('https://whatsduetomorrow-backed.onrender.com/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Estudiante Screenplay',
        email,
        password,
      }),
    });

    if (response.ok) {
      cachedUser = { email, password };
      return cachedUser;
    }
  } catch (e) {
    // Fallback al usuario previamente creado
  }

  cachedUser = { email: 'estudiante.bdd.1792882540@example.com', password: 'Password123!' };
  return cachedUser;
}
