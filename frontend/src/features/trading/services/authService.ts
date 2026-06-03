const SESSION_STORAGE_KEY = "chartflow.auth.session";
const SESSION_CHANGE_EVENT = "chartflow.auth.session-change";
const DEVELOPMENT_FALLBACK_TOKEN = "development-fallback-token";
let cachedRawSession: string | null = null;
let cachedSession: AuthSession | null = null;

export interface AuthSession {
  readonly token: string;
  readonly username: string;
  readonly expiresAt: number;
}

interface AuthResponse {
  readonly token: string;
  readonly username: string;
  readonly expiresAt: number;
}

export async function login(username: string, password: string): Promise<AuthSession> {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      throw new Error("Invalid username or password.");
    }

    const session = (await response.json()) as AuthResponse;
    saveSession(session);
    return session;
  } catch (error) {
    if (import.meta.env.DEV && username === "demo" && password === "chartflow") {
      const session = {
        token: DEVELOPMENT_FALLBACK_TOKEN,
        username,
        expiresAt: Date.now() + 8 * 60 * 60 * 1000
      };

      saveSession(session);
      return session;
    }

    throw error;
  }
}

export function getStoredSession(): AuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawSession = window.localStorage.getItem(SESSION_STORAGE_KEY);

  if (rawSession === cachedRawSession) {
    return cachedSession;
  }

  cachedRawSession = rawSession;

  if (!rawSession) {
    cachedSession = null;
    return null;
  }

  try {
    const session = JSON.parse(rawSession) as AuthSession;

    if (!session.token || !session.username || session.expiresAt <= Date.now()) {
      clearSession();
      return null;
    }

    cachedSession = session;
    return session;
  } catch {
    clearSession();
    return null;
  }
}

export function saveSession(session: AuthSession) {
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  cachedRawSession = null;
  cachedSession = null;
  window.dispatchEvent(new Event(SESSION_CHANGE_EVENT));
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
  cachedRawSession = null;
  cachedSession = null;
  window.dispatchEvent(new Event(SESSION_CHANGE_EVENT));
}

export function subscribeToSessionChanges(callback: () => void): () => void {
  window.addEventListener(SESSION_CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(SESSION_CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}
