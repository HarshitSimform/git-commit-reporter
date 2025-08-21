# Copilot Coding Standards

These are the recommended coding standards for this Node.js + TypeScript project.  
Copilot must follow these rules when generating code in chat or inline suggestions.

---

## 📦 Project Stack

- **Language**: TypeScript (strict mode enabled)
- **Runtime**: Node.js (LTS)
- **Testing**: Jest
- **Linting/Formatting**: ESLint + Prettier

---

## 📝 General Rules

- Always enable and respect **TypeScript strict mode**.
- Prefer **async/await** over `.then()` chaining.
- Explicitly type function parameters and return values.
- Keep functions small and focused (single responsibility principle).
- Avoid “god files” — split logic into **modules**.

---

## 🔠 Naming Conventions

- Variables & functions → `camelCase`
- Classes, Interfaces, Types → `PascalCase`
- Constants → `UPPER_SNAKE_CASE`

---
