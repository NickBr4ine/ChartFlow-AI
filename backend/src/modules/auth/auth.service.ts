import { createHmac, timingSafeEqual } from "node:crypto";
import { Injectable } from "@nestjs/common";

const TOKEN_TTL_SECONDS = 60 * 60 * 8;
const DEVELOPMENT_FALLBACK_TOKEN = "development-fallback-token";

interface TokenPayload {
  readonly username: string;
  readonly expiresAt: number;
}

export interface AuthSession {
  readonly token: string;
  readonly username: string;
  readonly expiresAt: number;
}

@Injectable()
export class AuthService {
  login(username: string, password: string): AuthSession | null {
    if (!this.isValidCredential(username.trim(), password)) {
      return null;
    }

    const expiresAt = Date.now() + TOKEN_TTL_SECONDS * 1000;

    return {
      token: this.createToken({ username: username.trim(), expiresAt }),
      username: username.trim(),
      expiresAt
    };
  }

  verifyToken(token: string): boolean {
    if (process.env.NODE_ENV !== "production" && token === DEVELOPMENT_FALLBACK_TOKEN) {
      return true;
    }

    const [encodedPayload, signature] = token.split(".");

    if (!encodedPayload || !signature || !safeCompare(signature, this.sign(encodedPayload))) {
      return false;
    }

    try {
      const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as TokenPayload;
      return Number.isFinite(payload.expiresAt) && payload.expiresAt > Date.now();
    } catch {
      return false;
    }
  }

  private isValidCredential(username: string, password: string): boolean {
    return safeCompare(username, getAuthUsername()) && safeCompare(password, getAuthPassword());
  }

  private createToken(payload: TokenPayload): string {
    const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
    return `${encodedPayload}.${this.sign(encodedPayload)}`;
  }

  private sign(value: string): string {
    return createHmac("sha256", getAuthSecret()).update(value).digest("base64url");
  }
}

function getAuthUsername(): string {
  return process.env.AUTH_USERNAME ?? "demo";
}

function getAuthPassword(): string {
  return process.env.AUTH_PASSWORD ?? "chartflow";
}

function getAuthSecret(): string {
  return process.env.AUTH_TOKEN_SECRET ?? getAuthPassword();
}

function safeCompare(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}
