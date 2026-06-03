"use client";

import { AuthGate } from "./AuthGate";
import { TradingDashboard } from "./TradingDashboard";

export function AuthenticatedTradingApp() {
  return (
    <AuthGate>
      {(session, onLogout) => (
        <TradingDashboard authToken={session.token} userName={session.username} onLogout={onLogout} />
      )}
    </AuthGate>
  );
}
