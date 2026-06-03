import { Body, Controller, Post, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";

interface LoginBody {
  readonly username?: unknown;
  readonly password?: unknown;
}

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  login(@Body() body: LoginBody) {
    const username = typeof body.username === "string" ? body.username : "";
    const password = typeof body.password === "string" ? body.password : "";
    const session = this.authService.login(username, password);

    if (!session) {
      throw new UnauthorizedException({
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid username or password"
        }
      });
    }

    return session;
  }
}
