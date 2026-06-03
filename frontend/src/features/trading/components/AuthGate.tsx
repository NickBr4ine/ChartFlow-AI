"use client";

import { type FormEvent, type ReactNode, useState, useSyncExternalStore } from "react";
import {
  clearSession,
  getStoredSession,
  login,
  subscribeToSessionChanges,
  type AuthSession
} from "../services/authService";

interface AuthGateProps {
  readonly children: (session: AuthSession, onLogout: () => void) => ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const session = useSyncExternalStore(subscribeToSessionChanges, getStoredSession, () => null);
  const [username, setUsername] = useState("demo");
  const [password, setPassword] = useState("chartflow");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(username, password);
    } catch {
      setError("Credenciais invalidas.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    clearSession();
  };

  if (session) {
    return <>{children(session, handleLogout)}</>;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-chart-background px-5 text-white">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-md border border-chart-border bg-chart-panel p-5">
        <p className="text-sm font-semibold uppercase text-chart-cyan">ChartFlow AI</p>
        <h1 className="mt-2 text-xl font-semibold text-white">Autenticacao</h1>

        <label className="mt-5 block text-sm text-chart-muted">
          Usuario
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="mt-2 h-11 w-full rounded-md border border-chart-border bg-chart-background px-3 text-white outline-none focus:border-chart-cyan"
            autoComplete="username"
          />
        </label>

        <label className="mt-4 block text-sm text-chart-muted">
          Senha
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 h-11 w-full rounded-md border border-chart-border bg-chart-background px-3 text-white outline-none focus:border-chart-cyan"
            type="password"
            autoComplete="current-password"
          />
        </label>

        {error ? <p className="mt-3 text-sm text-chart-red">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-5 h-11 w-full rounded-md bg-chart-cyan px-4 text-sm font-semibold text-chart-background disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}
