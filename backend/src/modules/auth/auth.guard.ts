import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import type { Request } from "express";
import { AuthService } from "./auth.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.headers.authorization?.replace(/^Bearer\s+/i, "").trim();

    if (token && this.authService.verifyToken(token)) {
      return true;
    }

    throw new UnauthorizedException({
      error: {
        code: "AUTH_REQUIRED",
        message: "Authentication is required"
      }
    });
  }
}
