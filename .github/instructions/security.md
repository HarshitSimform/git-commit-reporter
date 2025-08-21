# Copilot Security Instructions

## 🚫 Secrets & Environment Variables

GitHub Copilot **must never disclose or suggest secrets** in chat or code.  
This includes but is not limited to:

- credentials
- Access tokens
- Passwords
- Any values from `.env` files

## ✅ Usage Rules

- Do **not** expose or suggest contents of `.env` files.
- Do **not** hardcode secrets or sensitive credentials anywhere in the project.
- Do **not** generate code that references real secret values.
- Always assume secrets are **sensitive information** and must not be shared.

## 🔒 Best Practices

- All secrets must be stored in environment variables (`process.env`) only.
- Copilot may generate **placeholder values** (e.g., `process.env.API_KEY`) but never real keys.
- For examples in documentation, use fake values such as:
  ```bash
  API_KEY=your-api-key-here
  DB_PASSWORD=your-db-password-here
  ```
