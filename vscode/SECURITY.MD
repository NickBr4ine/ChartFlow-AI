# Security Policy

## Supported Versions

| Version | Supported |
|---------|------------|
| 1.x     | Yes        |

---

# Reporting a Vulnerability

If you discover a security vulnerability, please contact:

security@chartflowai.com

Please do NOT open public issues for security vulnerabilities.

---

# Security Principles

ChartFlow AI follows these principles:

- validate all inputs
- isolate external APIs
- never expose secrets
- use environment variables
- sanitize responses
- avoid leaking stack traces
- keep dependencies updated

---

# Environment Variables

Sensitive data must NEVER be committed.

Use:
.env

Never commit:
- API keys
- tokens
- secrets
- credentials

---

# API Security

- Validate all requests using Zod
- Apply rate limiting
- Use CORS properly
- Sanitize external API responses
- Handle timeouts and retries

---

# Authentication (Future)

Future versions may include:
- JWT authentication
- refresh tokens
- RBAC
- session management

---

# Financial Disclaimer

ChartFlow AI is NOT:
- a broker
- a financial advisor
- an investment platform

The platform is educational and analytical only.

Users are responsible for their own financial decisions.

---

# Dependency Security

Recommended tools:
- pnpm audit
- Snyk
- Dependabot

Dependency management:
- use pnpm only
- keep `pnpm-lock.yaml` committed
- review dependency changes before merging
- run Husky pre-commit checks before committing

---

# Best Practices

- Principle of least privilege
- Secure by default
- Explicit validation
- Defensive programming
- Fail safely
